'use strict';
import Logger from './logger';

class BackgroundManager {
  constructor() {
    this.enabled = false;
    this.hint = false;
    this.autoinsertanswer = false;
    this.autosubmit = false;
    this.autosubmitdelay = 0;
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
      if (this.enabled && this.currentUrl?.includes('room')) {
        Logger.log('🚀 ~ Starting extension');
        this.send({
          message: 'enabled',
          value: true,
        });
      }
      if (this.enabled && !this.currentUrl?.includes('room')) {
        Logger.log('🏁 ~ Stopping extension');
        this.send({
          message: 'enabled',
          value: false,
        });
      }
    }
  }

  handleMessage(request, sender, sendResponse) {
    switch (request.message) {
      case 'enabled':
        this.enabled = request.value;
        if (request.value === true) {
          if (this.currentUrl?.includes('room')) {
            Logger.log('🚀 ~ Starting extension');
            this.send({
              message: 'enabled',
              value: true,
            });
          }
        } else if (request.value === false) {
          Logger.log('🏁 ~ Stopping extension');
          this.send({
            message: 'enabled',
            value: false,
          });
        }
        break;
      case 'hint':
        this.hint = request.value;
        Logger.log('🔎 ~ Toggling hint:', request.value);
        this.send({
          message: 'hint',
          value: request.value,
        });
        break;
      case 'autoinsertanswer':
        this.autoinsertanswer = request.value;
        Logger.log('📝 ~ Toggling autoinsertanswer:', request.value);
        this.send({
          message: 'autoinsertanswer',
          value: request.value,
        });
        break;
      case 'autosubmit':
        this.autosubmit = request.value;
        Logger.log('🚗 ~ Toggling autosubmit:', request.value);
        this.send({
          message: 'autosubmit',
          value: request.value,
        });
        break;
      case 'autosubmitdelay':
        this.autosubmitdelay = request.value;
        Logger.log('🕒 ~ Changing autosubmit delay:', request.value);
        this.send({
          message: 'autosubmitdelay',
          value: request.value,
        });
      case 'status':
        sendResponse({
          enabled: this.enabled,
          hint: this.hint,
          autoinsertanswer: this.autoinsertanswer,
          autosubmit: this.autosubmit,
          autosubmitdelay: this.autosubmitdelay,
        });
        break;
      case 'getOptions':
        sendResponse({
          enabled: this.enabled && this.currentUrl?.includes('room'),
          hint: this.hint,
          autoinsertanswer: this.autoinsertanswer,
          autosubmit: this.autosubmit,
          autosubmitdelay: this.autosubmitdelay,
        });
        break;
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
