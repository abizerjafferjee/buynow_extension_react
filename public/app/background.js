var firebaseConfig = {
	apiKey: "AIzaSyBxPKk95jjKsufgZ2xFZlQBLdJURkVNnvE",
	authDomain: "buynow-app.firebaseapp.com",
	databaseURL: "https://buynow-app.firebaseio.com",
	projectId: "buynow-app",
	storageBucket: "buynow-app.appspot.com",
	messagingSenderId: "23251607808",
	appId: "1:23251607808:web:8ffe8824b643c076d193e5",
	measurementId: "G-BJEKG38NNQ"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database()

const streamRef = database.ref('stream_meta')
var stageRef = null
var linkRef = null
var activeTabId = null
var activeTabHref = null
var activeStreamer = null

// Called when the user clicks on the browser action
chrome.pageAction.onClicked.addListener(function(tab) {
	streamEvents()
});

// // Called when the user clicks on the browser action
// chrome.browserAction.onClicked.addListener(function(tab) {
// 	main()
// });

// chrome.tabs.onActivated.addListener(function(activeInfo) {
// 	console.log(activeInfo)
// })

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (tabId === activeTabId) {
		if (tab.url !== activeTabHref) {
			showPageAction()
		}
	}
})

// Listens and responds to messages from content script
chrome.runtime.onMessage.addListener(function(request, render, sendResponse) {
	handleListenerEvents(request)
	sendResponse()
})

// Entry function for listening to stream changes
function streamEvents() {
	stageRef = database.ref(`streams/${activeStreamer}`)
	stageRef.on('value', snapshot => handleEvents(snapshot.val()))
}

function handleEvents(data) {
	if (data) {
		if (data.active.stage !== undefined) {
			const stagedLinks = data.active.stage
			const linkIds = Object.keys(stagedLinks)
			let activeLinkId = null
	
			for (const id of linkIds) {
				if (stagedLinks[id].active) {
					activeLinkId = id
				}
			}
	
			if (activeLinkId) {
				preparePopup(activeLinkId)
			}
		} else {
			// Show placeholder if user clicks page action but there is no staged data
			chrome.tabs.sendMessage(activeTabId, {type: 'clicked-browser-action'});
		}
	}
}

function preparePopup(linkId) {
	linkRef = database.ref(`links/${activeStreamer}/${linkId}`)
	linkRef.once('value', function(snapshot) {
		const data = snapshot.val()
		chrome.storage.local.set({"link": data}, function() {
			chrome.tabs.sendMessage(activeTabId, {type: 'clicked-browser-action'});
		})
	})
}

// Handles messages from content script
function handleListenerEvents(request) {
	if (request.type === 'show-page-action') {
		showPageAction()
	} else if (request.type === 'click-buy-button') {
		chrome.tabs.create({ 
			url: request.url 
		})
	} else if (request.type === 'close-frame') {
		chrome.tabs.sendMessage(activeTabId, {
			type: 'close-frame'
		})
	}
}

// A reset is called to turn of any firebase listeners,
// reset active tab id and href, and reset active streamer
// and clear link from storage
function reset() {
	if (stageRef !== null) {
		stageRef.off()
		stageRef = null
	}
	chrome.storage.local.set({"link": null})
	linkRef = null
	activeTabId = null
	activeTabHref = null
	activeStreamer = null
}

// Query firebase to find a stream in stream_meta that has the same href
function getStream() {
	return streamRef.orderByChild("stream").equalTo(activeTabHref).once('value')
}

// If href is an active stream -> get active streamer
// Sets activeTabId, activeTabHref, activeStreamer
function showPageAction() {
	reset()

	chrome.tabs.query({active: true, currentWindow:true}, function(tabs) {
		var activeTab = tabs[0];
		const url = new URL(activeTab.url)
		activeTabId = activeTab.id
		activeTabHref = url.href

		getStream()
		.then(snapshot => {
			const data = snapshot.val()
			if (data) {
				const key = Object.keys(data)[0]
				const obj = data[key]
				activeStreamer = obj.uid
				chrome.pageAction.show(activeTabId)
			}
		})
	})

}