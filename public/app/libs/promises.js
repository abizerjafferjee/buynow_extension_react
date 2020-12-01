let getCurrentTab = query => new Promise((resolve, reject) => {
	chrome.tabs.query(query, resolve)
})

let enableBrowserAction = tabId => new Promise((resolve, reject) => {
	chrome.browserAction.enable(tabId, resolve)
})

let sendMessage = (tabId, params) => new Promise((resolve, reject) => {
	chrome.tabs.sendMessage(tabId, params, resolve)
})