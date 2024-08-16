"use strict";
import Logger from "./logger";

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
    this.enabled = false;
    this.hint = false;
    this.autoinsertanswer = false;
    this.autosubmit = false;
    this.autosubmitdelaymin = 2.5;
    this.autosubmitdelaymax = 8;
    this.typingdelay = 0;
    this.apikey = "";

    this.retrieveSettings();

    this.currentUrl = "";
    this.currentTabId = null;

    this.registerListeners();
  }

  async retrieveSettings() {
    try {
      this.enabled = (await getFromStorage("enabled")) ?? this.enabled;
      this.hint = (await getFromStorage("hint")) ?? this.hint;
      this.autoinsertanswer =
        (await getFromStorage("autoinsertanswer")) ?? this.autoinsertanswer;
      this.autosubmit = (await getFromStorage("autosubmit")) ?? this.autosubmit;
      this.autosubmitdelaymin =
        parseFloat(await getFromStorage("autosubmitdelaymin")) ?? this.autosubmitdelaymin;
      this.autosubmitdelaymax =
        parseFloat(await getFromStorage("autosubmitdelaymax")) ?? this.autosubmitdelaymax;
      this.typingdelay =
        parseInt(await getFromStorage("typingdelay")) ?? this.typingdelay;
      this.apikey = (await getFromStorage("apikey")) ?? this.apikey;

      Logger.log("🔧📦 ~ Settings retrieved from the storage:", {
        enabled: this.enabled,
        hint: this.hint,
        autoinsertanswer: this.autoinsertanswer,
        autosubmit: this.autosubmit,
        autosubmitdelaymin: this.autosubmitdelaymin,
        autosubmitdelaymax: this.autosubmitdelaymax,
        typingdelay: this.typingdelay,
        apikey: this.apikey,
      });
    } catch (error) {
      Logger.log("🚨 ~ Error retrieving the settings from the storage:", error);
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
      Logger.log("🌐 ~ Current url:", tab.url);
      this.currentUrl = tab.url;
      this.currentTabId = tab.id;
    });
  }

  handleTabUpdated(tabId, changeInfo) {
    this.currentTabId = tabId;
    if (changeInfo.url?.includes("squiz")) {
      Logger.log("🔄🌐 ~ URL updated:", changeInfo.url);
      this.currentUrl = changeInfo.url;
      if (this.enabled && this.currentUrl?.includes("room")) {
        Logger.log("🚀 ~ Starting extension");
        this.send({
          message: "enabled",
          value: true,
        });
      }
      if (this.enabled && !this.currentUrl?.includes("room")) {
        Logger.log("🏁 ~ Stopping extension");
        this.send({
          message: "enabled",
          value: false,
        });
      }
    }
  }

  handleMessage(request, sender, sendResponse) {
    // Save settings to storage
    if (request.message !== "status" && request.message !== "getOptions") {
      setInStorage(request.message, request.value);
      Logger.log(
        `🔧🗃️💾 ~ Settings saved to the sorage: ${
          (request.message, request.value)
        }`
      );
    }

    switch (request.message) {
      case "enabled":
        this.enabled = request.value;
        if (request.value === true) {
          if (this.currentUrl?.includes("room")) {
            Logger.log("🚀 ~ Starting extension");
            this.send({
              message: "enabled",
              value: true,
            });
          }
        } else if (request.value === false) {
          Logger.log("🏁 ~ Stopping extension");
          this.send({
            message: "enabled",
            value: false,
          });
        }
        break;
      case "hint":
        this.hint = request.value;
        Logger.log("🔎 ~ Toggling hint:", request.value);
        this.send({
          message: "hint",
          value: request.value,
        });
        break;
      case "autoinsertanswer":
        this.autoinsertanswer = request.value;
        Logger.log("📝 ~ Toggling autoinsertanswer:", request.value);
        this.send({
          message: "autoinsertanswer",
          value: request.value,
        });
        break;
      case "autosubmit":
        this.autosubmit = request.value;
        Logger.log("🚗 ~ Toggling autosubmit:", request.value);
        this.send({
          message: "autosubmit",
          value: request.value,
        });
        break;
      case "autosubmitdelaymin":
        this.autosubmitdelaymin = request.value;
        Logger.log("⏱🤏⬇️ ~ Changing minimum autosubmit delay:", request.value);
        this.send({
          message: "autosubmitdelaymin",
          value: request.value,
        });
        break;
      case "autosubmitdelaymax":
        this.autosubmitdelaymax = request.value;
        Logger.log("⏱💪⬆️ ~ Changing maximum autosubmit delay:", request.value);
        this.send({
          message: "autosubmitdelaymax",
          value: request.value,
        });
        break;
      case "typingdelay":
        this.typingdelay = request.value;
        Logger.log("⏱⌨️ ~ Changing typing delay:", request.value);
        this.send({
          message: "typingdelay",
          value: request.value,
        });
        break;
      case "apikey":
        this.apikey = request.value;
        Logger.log("🔑 ~ API key:", request.value);
        this.send({
          message: "apikey",
          value: request.value,
        });
        break;
      case "status":
        sendResponse({
          enabled: this.enabled,
          hint: this.hint,
          autoinsertanswer: this.autoinsertanswer,
          autosubmit: this.autosubmit,
          autosubmitdelaymin: this.autosubmitdelaymin,
          autosubmitdelaymax: this.autosubmitdelaymax,
          typingdelay: this.typingdelay,
          apikey: this.apikey,
        });
        break;
      case "getOptions":
        sendResponse({
          enabled: this.enabled && this.currentUrl?.includes("room"),
          hint: this.hint,
          autoinsertanswer: this.autoinsertanswer,
          autosubmit: this.autosubmit,
          autosubmitdelaymin: this.autosubmitdelaymin,
          autosubmitdelaymax: this.autosubmitdelaymax,
          typingdelay: this.typingdelay,
          apikey: this.apikey,
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
