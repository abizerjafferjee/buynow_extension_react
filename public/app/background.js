

var allActiveTabIds = []
var stageRef = null
var linkRef = null
var activeTabId = null
var activeTabHref = null
var activeStreamer = null

chrome.runtime.onInstalled.addListener(function() {
	chrome.browserAction.disable()
})

chrome.tabs.onActivated.addListener(async function(activeInfo) {
	const tabId = activeInfo.tabId

	if (allActiveTabIds.includes(tabId)) {
		sendMessage(tabId, {type: 'window-location'})
	} 

	else { reset() }
})

chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab) {

	if (activeTabId && tabId === activeTabId) {
		sendMessage(tabId, {type: 'window-location'})
	}

})

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
	
	if (activeTabId && tabId === activeTabId) {
		cleanUpLiveSale()
	}

})

// Listens and responds to messages from content script
chrome.runtime.onMessage.addListener(function(request, render, sendResponse) {

	if (request.type === 'window-location') {
		const currentTabUrl = request.payload
		handleLiveSale(currentTabUrl)

	} else if (request.type === 'click-buy-button') {
		chrome.tabs.create({ url: request.url })

	} else if (request.type === 'close-frame') {
		sendMessage(activeTabId, {type: 'close-frame'})

	}

	// sendResponse()

})

// Runs when the content script is initially run
async function handleLiveSale(currentTabUrl) {

	reset()
	
	activeTabHref = currentTabUrl
	const currentTab = await getCurrentTab({active: true, currentWindow:true})
	activeTabId = currentTab[0].id

	if (!allActiveTabIds.includes(activeTabId)) {
		allActiveTabIds.push(activeTabId)
	}
	
	await enableBrowserAction()

	const streamRef = database.ref('stream_meta')
	const snapshot = await streamRef.orderByChild("stream")
																	.equalTo(activeTabHref)
																	.once('value')
	const data = snapshot.val()

	if (data) {
		setActiveStreamer(data)
		chrome.browserAction.setBadgeText({text:'live', tabId:activeTabId})
		handleLiveSaleEvents()

	} else {
		sendMessage(activeTabId, {type: 'close-frame'})
		chrome.browserAction.setBadgeText({text: '', tabId: activeTabId})

	}
	
}

function setActiveStreamer(data) {
	key = Object.keys(data)[0]
	const obj = data[key]
	activeStreamer = obj.uid
}

async function handleLiveSaleEvents() {

	if (activeStreamer) {
		streamEvents()
	} else {
		sendMessage(activeTabId, {type: 'close-frame'})
	}

}

// Entry function for listening to stream changes
async function streamEvents() {
	stageRef = database.ref(`streams/${activeStreamer}`)
	stageRef.on(
		'value',
		snapshot => handleEvents(snapshot.val())
	)
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
				showCheckout(activeLinkId)
			} else {
				// Show placeholder if there is no staged data
				sendMessage(activeTabId, {type: 'clicked-browser-action'})
			}
		} else {
			// Show placeholder if there is no staged data
			sendMessage(activeTabId, {type: 'clicked-browser-action'})
		}

	} else {
		sendMessage(activeTabId, {type: 'close-frame'})

	}

}

async function showCheckout(linkId) {

	linkRef = database.ref(`links/${activeStreamer}/${linkId}`)
	snapshot = await linkRef.once('value')
	const data = snapshot.val()

	await sendMessage(
		activeTabId,
		{type: 'link', link: data}
	)

	await sendMessage(
		activeTabId,
		{type: 'clicked-browser-action'}
	)
	
}

function cleanUpLiveSale(tabId) {

	if (allActiveTabIds.includes(activeTabId)) {
		const idIndex = allActiveTabIds.indexOf(activeTabId)
		allActiveTabIds.split(idIndex, 1)
	}
	
	reset()
}

// Turn of any firebase listeners and reset global variables
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