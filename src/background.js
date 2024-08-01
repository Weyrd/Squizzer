'use strict';

var enabled = false;
var currentUrl;
var currentTabId;

// When the user changes the tab, update the current tab url
chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    console.log('Current url:', tab.url);
    currentUrl = tab.url;
    currentTabId = tab.id;
  });
});

// Listen for tab updates, if the url changes, start the extension
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  currentTabId = tabId;
  if (changeInfo.url?.includes('squiz')) {
    console.log('Url updated:', changeInfo.url);
    currentUrl = changeInfo.url;
    if (enabled && currentUrl?.includes('room')) sendStart();
    if (enabled && !currentUrl?.includes('room')) sendStop();
  }
});

// Listen for messages from the popup, if toggle is activated
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === 'enable') {
    enabled = true;
    if (currentUrl?.includes('room')) sendStart();
  } else if (request.message === 'disable') {
    enabled = false;
    sendStop();
  } else if (request.message === 'status') {
    sendResponse({
      enabled,
    });
  }
});

function sendStart() {
  console.log('Starting extension');
  chrome.tabs.sendMessage(currentTabId, {
    message: 'start',
  });
}

function sendStop() {
  console.log('Stopping extension');
  chrome.tabs.sendMessage(currentTabId, {
    message: 'stop',
  });
}
