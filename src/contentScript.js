"use strict";

import Logger from "./logger";
import { MESSAGES } from "./constants";
import { requestGPT } from "./openAI";
import {
  createAnswerDiv,
  simulateTyping,
  startTimer,
  hideRefresh,
  showRefresh,
} from "./domUtils";
import { getXPathElement, observerConditions } from "./xpathManager.js";

class ScriptManager {
  constructor() {
    this.observerGame = null;
    this.observerGlobal = null;

    // Extension options
    this.settings = {
      enabled: null,
      hint: false,
      canCopy: true,
      autoinsertanswer: false,
      autosubmit: false,
      autosubmitdelaymin: 0,
      autosubmitdelaymax: 0,
      typingdelay: 0,
      apikey: null,
      noblur: false,
    };

    this.startTime = null; // Time when the question is displayed
    this.previousAnswers = [];

    this.registerListeners();

    // Send message to background script to get the state of the extension
    chrome.runtime.sendMessage({ message: "getOptions" }, (response) => {
      if (response) {
        Logger.log("📡 ~ Received status from background script:", response);
        Object.assign(this.settings, response);
        // Ensure the canCopy state is updated based on hint value
        this.settings.canCopy = !this.settings.hint;

        if (response.enabled) {
          Logger.log("🟢 ~ Extension enabled");
          setTimeout(() => this.start(), 500); // Wait for DOM to load (especially in custom games)
        }
      }
    });
  }

  registerListeners() {
    chrome.runtime.onMessage.addListener((request) => {
      this.handleMessage(request);
    });
  }

  handleMessage({ message, value }) {
    const emojiMap = {
      enabled: '🟢',
      hint: "🔎",
      autoinsertanswer: "📝",
      autosubmit: "🚗",
      autosubmitdelaymin: "⏱🤏⬇️",
      autosubmitdelaymax: "⏱💪⬆️",
      typingdelay: "⏱⌨️",
      apikey: "🔑",
      noblur: "👓",
      default: "⚙️",
    };
    Logger.log(
      `${emojiMap[message] || emojiMap.default} ~ Setting updated :`,
      message,
      value
    );
    this.settings[message] =
      typeof value === "number" ? parseFloat(value) : value;

    switch (message) {
      case "enabled":
        if (value) {
          setTimeout(() => this.start(), 500);
        } else {
          this.stop();
        }
        break;
      case "hint":
        this.settings.canCopy = !value;
        break;
      case "noblur":
        if (document.querySelector("#divTextAnswerGPT")) {
          document.querySelector("#divTextAnswerGPT").style.filter = value
            ? "none"
            : "";
        }
        break;
    }
  }

  createObserver(targetElement) {
    this.observerGlobal = new MutationObserver(this.handleDOMChange.bind(this));
    this.observerGlobal.observe(targetElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    document.body.style.border = "1px solid green";
    Logger.log("➕👀 ~ Observer created");
  }

  removeObserver() {
    if (this.observerGlobal) {
      this.observerGlobal.disconnect();
      this.observerGlobal = null;
      document.body.style.border = "1px solid orange";
      Logger.log("➖👀 ~ Observer removed");
    }
  }

  async handleQuestionChange(isRefresh = false) {
    const question = getXPathElement("QUESTION_XPATH").innerText;

    // Start timer if needed (do not refresh when you ask a new answer)
    if (!isRefresh) {
      startTimer();
      this.startTime = Date.now();
    }
    const divTextAnswerGPT = document.querySelector("#divTextAnswerGPT");
    divTextAnswerGPT.innerText = " ";
    const divMiddleHeaderGpt = document.querySelector("#divMiddleHeaderGpt");
    divMiddleHeaderGpt.innerText = MESSAGES.REQUEST_IN_PROGRESS;

    const result = await requestGPT(
      question,
      this.settings.hint,
      this.settings.previousAnswers,
      this.settings.apikey
    );
    divMiddleHeaderGpt.innerText = this.settings.hint
      ? MESSAGES.HINT_RECEIVED
      : MESSAGES.RESPONSE_RECEIVED;
    divTextAnswerGPT.innerText = result;
    this.previousAnswers.push(result);
    showRefresh();

    // Hint mode = cant copy
    this.settings.canCopy = !this.settings.hint;

    if (this.settings.autoinsertanswer) {
      this.insertAnswerGPT();
    }

    divTextAnswerGPT.style.filter = this.settings.noblur ? "none" : "";
  }

  handleDOMChange(records) {
    // If the DOM change is not related to a question, we return
    if (
      !records.some((record) => record.target?.innerText?.includes("Question"))
    )
      return;

    // Show the records if you want to understand the DOM changes
    //console.log(records);

    if (
      observerConditions.isNewGame(records) ||
      observerConditions.isNewQuestion(records)
    ) {
      Logger.log("👀❓ ~ Question change detected");

      if (!document.querySelector("#divGPT")) {
        createAnswerDiv();
        document
          .querySelector("#divTextAnswerGPT")
          .addEventListener("click", () => this.insertAnswerGPT());
        document
          .querySelector("#divFooterLeftGpt")
          .addEventListener("click", () => this.handleQuestionChange(true));
      }
      this.previousAnswers = [];
      this.handleQuestionChange();
      return;
    }

    if (observerConditions.isNewAnswer(records)) {
      Logger.log("👀📝 ~ Answer change detected");

      this.settings.canCopy = false;

      hideRefresh();
      return;
    }
  }

  insertAnswerGPT() {
    var answerGPT = document
      .querySelector("#divTextAnswerGPT")
      .innerText.trim();
    const input = getXPathElement("INPUT_XPATH");
    if (
      input &&
      this.settings.canCopy &&
      answerGPT != "" &&
      !Object.values(MESSAGES).some((message) => answerGPT.includes(message))
    ) {
      input?.focus();
      Logger.log(`~~~Start time is ${this.startTime}`);
      simulateTyping(
        input,
        answerGPT,
        this.settings.typingdelay,
        this.settings.autosubmit,
        this.settings.startTime,
        this.settings.autosubmitdelaymin,
        this.settings.autosubmitdelaymax
      );
    }
  }

  start() {
    document.body.style.boxSizing = "border-box";
    document.body.style.border = "1px solid orange";

    const globalDiv = getXPathElement("GLOBAL_XPATH");
    this.createObserver(globalDiv);
  }

  stop() {
    document.body.style.border = "none";
    this.removeObserver();
    const divGPT = document.querySelector("#divGPT");
    if (divGPT) divGPT.remove();
  }
}

new ScriptManager();
