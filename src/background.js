'use strict';
import Logger from './logger';

function getFromStorage(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(key, (data) => {
      resolve(data[key]);
    });
  });
}

function setInStorage(key, value) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ [key]: value }, () => {
      resolve();
    });
  });
}

class BackgroundManager {
  constructor() {
    // Extension Settings
    this.settings = {
      enabled: false,
      hint: false,
      autoinsertanswer: false,
      autosubmit: false,
      autosubmitdelaymin: 2.5,
      autosubmitdelaymax: 8,
      typingdelay: 10,
      apikey: '',
      noblur: false,
    };

    this.retrieveSettings();

    this.currentUrl = '';
    this.currentTabId = null;

    this.registerListeners();
  }

  async retrieveSettings() {
    try {
      const keys = Object.keys(this.settings);
      const values = await Promise.all(keys.map(getFromStorage));

      keys.forEach((key, index) => {
        this.settings[key] = values[index] ?? this.settings[key];
        if (['autosubmitdelaymin', 'autosubmitdelaymax', 'typingdelay'].includes(key)) {
          this.settings[key] = parseFloat(this.settings[key]);
        }
      });

      Logger.log('🔧📦 ~ Settings retrieved from the storage:', this.settings);
    } catch (error) {
      Logger.log('🚨 ~ Error retrieving the settings from the storage:', error);
    }
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
      Logger.log('🌐 ~ Current url:', tab.url);
      this.currentUrl = tab.url;
      this.currentTabId = tab.id;
    });
  }

  handleTabUpdated(tabId, changeInfo) {
    this.currentTabId = tabId;
    if (changeInfo.url?.includes('squiz')) {
      Logger.log('🔄🌐 ~ URL updated:', changeInfo.url);
      this.currentUrl = changeInfo.url;
      if (this.settings.enabled && this.currentUrl?.includes('room')) {
        Logger.log('🚀 ~ Starting extension');
        this.send({
          message: 'enabled',
          value: true,
        });
      }
      if (this.settings.enabled && !this.currentUrl?.includes('room')) {
        Logger.log('🏁 ~ Stopping extension');
        this.send({
          message: 'enabled',
          value: false,
        });
      }
    }
  }

  handleMessage(request, sender, sendResponse) {
    if (request.message !== 'status' && request.message !== 'getOptions') {
      setInStorage(request.message, request.value);
      Logger.log(`🔧🗃️💾 ~ Settings saved: '${request.message}' -> '${request.value}'`);
    }

    const settingsKeys = Object.keys(this.settings);

    if (settingsKeys.includes(request.message)) {
      this.settings[request.message] = request.value;
      Logger.log(`🔧 ~ Toggling ${request.message}:`, request.value);
      this.send({ message: request.message, value: request.value });
    }

    if (['status', 'getOptions'].includes(request.message)) {
      const response = { ...this.settings };
      if (request.message === 'getOptions') {
        response.enabled = this.settings.enabled && this.currentUrl?.includes('room');
      }
      sendResponse(response);
    }
  }

  send(object) {
    if (this.currentTabId !== null) {
      chrome.tabs.sendMessage(this.currentTabId, object);
    }
  }
}

// Instantiate the BackgroundManager
new BackgroundManager();
