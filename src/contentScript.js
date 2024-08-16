'use strict';

import Logger from './logger';
import { MESSAGES } from './constants';
import { requestGPT } from './openAI';
import { getXPathElement, createAnswerDiv, simulateTyping, startTimer, hideRefresh, showRefresh } from './domUtils';

const observerConditions = {
  // New question div
  isNewGame: (records) =>
    records.some(
      (record) =>
        record.type === 'childList' &&
        record.target.className === 'css-1dbjc4n r-16y2uox' &&
        record.addedNodes.length === 1 &&
        record.addedNodes[0].className.includes('css-1dbjc4n') &&
        record.addedNodes[0].className.includes('r-1dzdj1l') &&
        record.addedNodes[0].className.includes('r-1pcd2l5')
    ),
  // Same question div, different question
  isNewQuestion: (records) =>
    records.some(
      (record) =>
        record.type === 'characterData' &&
        record.target.parentNode.className.includes('css-901oao') &&
        record.target.parentNode.className.includes('r-jwli3a') &&
        record.target.parentNode.className.includes('r-1mkrsdo') &&
        record.target.parentNode.className.includes('r-1x35g6')
    ),
  // New answer div
  isNewAnswer: (records) =>
    records.some(
      (record) =>
        record.type === 'childList' &&
        record.target.className === 'css-1dbjc4n r-16y2uox' &&
        record.addedNodes.length === 1 &&
        record.addedNodes[0].className === 'css-1dbjc4n'
    ),
};

class ScriptManager {
  constructor() {
    this.observerGame = null;
    this.observerGlobal = null;

    // Extension options
    this.hint = false;
    this.canCopy = true;
    this.autoinsertanswer = false;
    this.autosubmit = false;
    this.autosubmitdelaymin = 0;
    this.autosubmitdelaymax = 0;
    this.typingdelay = 0;

    this.startTime = null; // Time of question
    this.previousAnswers = [];

    this.registerListeners();

    // Send message to background script to get the state of the extension
    chrome.runtime.sendMessage({ message: 'getOptions' }, (response) => {
      if (response) {
        Logger.log('📡 ~ Received status from background script:', response);
        this.hint = response.hint;
        this.autoinsertanswer = response.autoinsertanswer;
        this.autosubmit = response.autosubmit;
        this.autosubmitdelaymin = response.autosubmitdelaymin;
        this.autosubmitdelaymax = response.autosubmitdelaymax;
      }

      if (response.enabled) {
        Logger.log('🟢 ~ Extension enabled');
        setTimeout(() => this.start(), 500);
      }
    });
  }

  registerListeners() {
    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.message) {
        case 'enabled':
          if (request.value) {
            Logger.log('🟢 ~ Extension enabled');
            // settimeout pour attendre que la DOM se charge (surtout en custom game)
            setTimeout(() => this.start(), 500);
          } else {
            Logger.log('🔴 ~ Extension disabled');
            this.stop();
            setTimeout(() => this.stop(), 500);
          }
          break;
        case 'hint':
          Logger.log(`🔎 ~ Toggling hint: ${request.value}`);
          this.hint = request.value;
          this.canCopy = !request.value;
          break;
        case 'autoinsertanswer':
          Logger.log(`📝 ~ Toggling autoinsertanswer: ${request.value}`);
          this.autoinsertanswer = request.value;
          break;
        case 'autosubmit':
          Logger.log(`🚗 ~ Toggling autosubmit: ${request.value}`);
          this.autosubmit = request.value;
          break;
        case 'autosubmitdelaymin':
          Logger.log(`⏱🤏⬇️ ~ Changing minimum autosubmit delay: ${request.value}`);
          this.autosubmitdelaymin = parseFloat(request.value);
          break;
        case 'autosubmitdelaymax':
          Logger.log(`⏱💪⬆️ ~ Changing maximum autosubmit delay: ${request.value}`);
          this.autosubmitdelaymax = parseFloat(request.value);
          break;
        case 'typingdelay':
          Logger.log(`⏱⌨️ ~ Changing typing delay: ${request.value}`);
          this.typingdelay = parseFloat(request.value);
          break;
      }
    });
  }

  createObserver(targetElement) {
    this.observerGlobal = new MutationObserver(this.handleDOMChange.bind(this));
    this.observerGlobal.observe(targetElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    document.body.style.border = '1px solid green';
    Logger.log('➕👀 ~ Observer created');
  }

  removeObserver() {
    if (this.observerGlobal) {
      this.observerGlobal.disconnect();
      this.observerGlobal = null;
      document.body.style.border = '1px solid orange';
      Logger.log('➖👀 ~ Observer removed');
    }
  }

  async handleQuestionChange() {
    const question = getXPathElement('QUESTION_XPATH').innerText;

    this.startTime = Date.now();
    startTimer();
    const divTextAnswerGPT = document.querySelector('#divTextAnswerGPT');
    divTextAnswerGPT.innerText = ' ';
    const divMiddleHeaderGpt = document.querySelector('#divMiddleHeaderGpt');
    divMiddleHeaderGpt.innerText = MESSAGES.REQUEST_IN_PROGRESS;

    const result = await requestGPT(question, this.hint);
    divMiddleHeaderGpt.innerText = this.hint ? MESSAGES.HINT_RECEIVED : MESSAGES.RESPONSE_RECEIVED;
    divTextAnswerGPT.innerText = result;
    this.previousAnswers = [result];
    showRefresh();

    // Hint mode = cant copy
    this.canCopy = !this.hint;

    if (this.autoinsertanswer) {
      this.insertAnswerGPT();
    }
  }

  async handleRefresh() {
    const question = getXPathElement('QUESTION_XPATH').innerText;
    const divTextAnswerGPT = document.querySelector('#divTextAnswerGPT');
    divTextAnswerGPT.innerText = ' ';
    const divMiddleHeaderGpt = document.querySelector('#divMiddleHeaderGpt');
    divMiddleHeaderGpt.innerText = MESSAGES.REQUEST_IN_PROGRESS;

    const result = await requestGPT(question, this.hint, this.previousAnswers);
    divMiddleHeaderGpt.innerText = this.hint ? MESSAGES.HINT_RECEIVED : MESSAGES.RESPONSE_RECEIVED;
    divTextAnswerGPT.innerText = result;
    this.previousAnswers.push(result);
    showRefresh();

    // Hint mode = cant copy
    this.canCopy = !this.hint;

    if (this.autoinsertanswer) {
      this.insertAnswerGPT();
    }
  }

  handleDOMChange(records) {
    // If the DOM change is not related to a question, we return
    if (!records.some((record) => record.target?.innerText?.includes('Question'))) return;

    // Show the records if you want to understand the DOM changes
    //console.log(records);

    if (observerConditions.isNewGame(records)) {
      Logger.log('👀❓ ~ Question change detected (new game)');

      if (!document.querySelector('#divGPT')) {
        createAnswerDiv();
        document.querySelector('#divTextAnswerGPT').addEventListener('click', () => this.insertAnswerGPT());
        document.querySelector('#divFooterLeftGpt').addEventListener('click', () => this.handleRefresh());
      }
      this.handleQuestionChange();
      return;
    }

    if (observerConditions.isNewQuestion(records)) {
      Logger.log('👀❓ ~ Question change detected (same game)');

      if (!document.querySelector('#divGPT')) {
        createAnswerDiv();
        document.querySelector('#divTextAnswerGPT').addEventListener('click', () => this.insertAnswerGPT());
        document.querySelector('#divFooterLeftGpt').addEventListener('click', () => this.handleRefresh());
      }
      this.handleQuestionChange();
      return;
    }

    if (observerConditions.isNewAnswer(records)) {
      Logger.log('👀📝 ~ Answer change detected');

      this.canCopy = false;

      hideRefresh();
      return;
    }
  }

  insertAnswerGPT() {
    var answerGPT = document.querySelector('#divTextAnswerGPT').innerText.trim();
    const input = getXPathElement('INPUT_XPATH');
    if (input && this.canCopy && answerGPT != '' && !Object.values(MESSAGES).includes(answerGPT)) {
      input?.focus();
      simulateTyping(input, answerGPT, this.typingdelay, this.autosubmit, this.startTime, this.autosubmitdelaymin, this.autosubmitdelaymax);
    }
  }

  start() {
    document.body.style.boxSizing = 'border-box';
    document.body.style.border = '1px solid orange';

    const globalDiv = getXPathElement('GLOBAL_XPATH');
    this.createObserver(globalDiv);
  }

  stop() {
    document.body.style.border = 'none';
    this.removeObserver();
    const divGPT = document.querySelector('#divGPT');
    if (divGPT) divGPT.remove();
  }
}

new ScriptManager();
