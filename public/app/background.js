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
var activeStreamer = null

// Called when the user clicks on the browser action
chrome.browserAction.onClicked.addListener(function(tab) {
	if (stageRef !== null) {
		stageRef.off()
	}
	stageRef = null
	console.log('stage ref nullified')
	chrome.storage.local.set({"link": null}, function() {
		console.log('stored link nullified')
	})

	 // Send a message to the active tab
	chrome.tabs.query({active: true, currentWindow:true},function(tabs) {
		var activeTab = tabs[0];
		activeTabId = activeTab.id
		// chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});

		const url = new URL(activeTab.url)
		if (url.hostname === 'www.youtube.com') {
			getStream(url)
			.then(snapshot => streamEvents(snapshot.val()))
		}

	});
});

function getStream(url) {
	return streamRef.orderByChild("stream").equalTo(url.href).once('value')
}

function streamEvents(data) {
	const key = Object.keys(data)[0]
	const obj = data[key]
	activeStreamer = obj.uid
	stageRef = database.ref(`streams/${obj.uid}`)
	stageRef.on('value', snapshot => handleEvents(snapshot.val()))
}

function handleEvents(data) {
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
	}
}

function preparePopup(linkId) {
	linkRef = database.ref(`links/${activeStreamer}/${linkId}`)
	linkRef.once('value', function(snapshot) {
		const data = snapshot.val()
		chrome.storage.local.set({"link": data}, function() {
			console.log('data has been stored')
		})
		chrome.tabs.sendMessage(activeTabId, {"message": "clicked_browser_action"});
	})
}