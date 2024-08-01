'use strict';
import Logger from './logger';

class BackgroundManager {
  constructor() {
    this.enabled = false;
    this.currentUrl = '';
    this.currentTabId = null;

    this.registerListeners();
  }

  registerListeners() {
    // When the user changes the tab, update the current tab url
    chrome.tabs.onActivated.addListener(this.handleTabActivated.bind(this));

    // Listen for tab updates, if the URL changes, start or stop the extension
    chrome.tabs.onUpdated.addListener(this.handleTabUpdated.bind(this));

    // Listen for messages from the popup, if toggle is activated
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
  }

  handleTabActivated(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      Logger.log('[DEBUG] Current url:', tab.url);
      this.currentUrl = tab.url;
      this.currentTabId = tab.id;
    });
  }

  handleTabUpdated(tabId, changeInfo) {
    this.currentTabId = tabId;
    if (changeInfo.url?.includes('squiz')) {
      Logger.log('[DEBUG] URL updated:', changeInfo.url);
      this.currentUrl = changeInfo.url;
      if (this.enabled && this.currentUrl?.includes('room')) this.sendStart();
      if (this.enabled && !this.currentUrl?.includes('room')) this.sendStop();
    }
  }

  handleMessage(request, sender, sendResponse) {
    if (request.message === 'enable') {
      this.enabled = true;
      if (this.currentUrl?.includes('room')) this.sendStart();
    } else if (request.message === 'disable') {
      this.enabled = false;
      this.sendStop();
    } else if (request.message === 'status') {
      sendResponse({
        enabled: this.enabled,
      });
    }
  }

  sendStart() {
    Logger.log('[DEBUG] Starting extension');
    if (this.currentTabId !== null) {
      chrome.tabs.sendMessage(this.currentTabId, {
        message: 'start',
      });
    }
  }

  sendStop() {
    Logger.log('[DEBUG] Stopping extension');
    if (this.currentTabId !== null) {
      chrome.tabs.sendMessage(this.currentTabId, {
        message: 'stop',
      });
    }
  }
}

// Instantiate the BackgroundManager
new BackgroundManager();
