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

var allActiveTabIds = []
var stageRef = null
var linkRef = null
var activeTabId = null
var activeTabHref = null
var activeStreamer = null

chrome.runtime.onInstalled.addListener(function() {
	chrome.browserAction.disable()
})

// Called when the user clicks on the browser action
chrome.browserAction.onClicked.addListener(function(tab) {
	if (activeTabId && activeTabHref) {
		main()
	} else {
		// how can we handle if the user clicks browser action on youtube page
		// how do we differentiate with a user click which is not on a youtube page
		// what should happen in these two events?
	}
})

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
	if (activeTabId && tabId === activeTabId) {
		if (allActiveTabIds.includes(activeTabId)) {
			const idIndex = allActiveTabIds.indexOf(activeTabId)
			allActiveTabIds.split(idIndex, 1)
		}
		reset()
	}
})

chrome.tabs.onActivated.addListener(function(activeInfo) {
	const thisTabId = activeInfo.tabId
	if (allActiveTabIds.includes(thisTabId)) {
		chrome.tabs.sendMessage(thisTabId, {type: 'window-location'}, function (response) {
			if (response !== undefined) {
				if (response.type === 'window-location') {
					const url = response.payload
					showPageAction(url)
				}
			}
		})
	} else {
		// chrome.browserAction.disable()
		reset()
	}
})

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (activeTabId && tabId === activeTabId) {
		chrome.tabs.sendMessage(tabId, {type: 'window-location'}, function (response) {
			if (response !== undefined) {
				if (response.type === 'window-location') {
					const url = response.payload
					showPageAction(url)
				}
			}
		})
	}
})

// Listens and responds to messages from content script
chrome.runtime.onMessage.addListener(function(request, render, sendResponse) {
	handleListenerEvents(request)
	sendResponse()
})

function main() {
	getStream()
	.then(snapshot => {
		const data = snapshot.val()
		if (data) {
			const key = Object.keys(data)[0]
			const obj = data[key]
			activeStreamer = obj.uid
			streamEvents()
		} else {
			chrome.tabs.sendMessage(activeTabId, {
				type: 'close-frame'
			})
		}
	})
}


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
			} else {
				// Show placeholder if user clicks page action but there is no staged data
				chrome.tabs.sendMessage(activeTabId, {type: 'clicked-browser-action'});
			}
		} else {
			// Show placeholder if user clicks page action but there is no staged data
			chrome.tabs.sendMessage(activeTabId, {type: 'clicked-browser-action'});
		}
	} else {
		chrome.tabs.sendMessage(activeTabId, {
			type: 'close-frame'
		})
	}
}

function preparePopup(linkId) {
	linkRef = database.ref(`links/${activeStreamer}/${linkId}`)
	linkRef.once('value', function(snapshot) {
		const data = snapshot.val()
		chrome.tabs.sendMessage(activeTabId, {
			type: 'link',
			link: data
		}, function(response) {
			chrome.tabs.sendMessage(activeTabId, {type: 'clicked-browser-action'});
		})
	})
}

// Handles messages from content script
function handleListenerEvents(request) {
	if (request.type === 'show-page-action') {
		const activeUrl = request.payload
		showPageAction(activeUrl)
	} else if (request.type === 'click-buy-button') {
		chrome.tabs.create({ 
			url: request.url 
		})
	} else if (request.type === 'close-frame') {
		chrome.tabs.sendMessage(activeTabId, {
			type: 'close-frame'
		})
	} else if (request.type === 'tabId') {
		activeTabId = request.payload
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
	linkRef = null
	activeTabId = null
	activeTabHref = null
	activeStreamer = null
}

// Query firebase to find a stream in stream_meta that has the same href
function getStream() {
	const streamRef = database.ref('stream_meta')
	return streamRef.orderByChild("stream").equalTo(activeTabHref).once('value')
}

function showPageAction(url) {
	reset()
	activeTabHref = url
	chrome.tabs.query({active: true, currentWindow:true}, function(tabs) {
		var activeTab = tabs[0];
		activeTabId = activeTab.id
		if (!allActiveTabIds.includes(activeTabId)) {
			allActiveTabIds.push(activeTabId)
		}
		chrome.browserAction.enable(activeTab.id, function() {
			getStream()
			.then(snapshot => {
				const data = snapshot.val()
				if (data) {
					chrome.browserAction.setBadgeText({text:'live', tabId:activeTabId})
					main()
				} else {
					chrome.tabs.sendMessage(activeTabId, {
						type: 'close-frame'
					})
					chrome.browserAction.setBadgeText({text: '', tabId:activeTabId})
				}
			})
		})
	})
}

