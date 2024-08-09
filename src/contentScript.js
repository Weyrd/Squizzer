'use strict';

import Logger from './logger';
import { MESSAGES } from './constants';
import { requestGPT } from './openAI';
import { getXPathElement, createAnswerDiv, simulateTyping, startTimer } from './domUtils';

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
    this.hint = false;
    this.canCopy = true;
    this.autosubmit = false;

    this.registerListeners();
  }

  registerListeners() {
    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.message) {
        case 'enabled':
          if (request.value) {
            Logger.log('🚀 ~ Extension activée');
            // settimeout pour attendre que la DOM se charge (surtout en custom game)
            setTimeout(() => this.start(), 500);
          } else {
            Logger.log('🏁 ~ Extension desactivée');
            this.stop();
          }
          break;
        case 'hint':
          Logger.log(`🔎 ~ Hint updated : ${request.value}`);
          this.hint = request.value;
          this.canCopy = !request.value;
          break;
        case 'autosubmit':
          Logger.log(`🔎 ~ Autosubmit updated : ${request.value}`);
          this.autosubmit = request.value;
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
    document.body.style.border = '1px solid purple';
    Logger.log('👀 ~ Observer created.');
  }

  removeObserver() {
    if (this.observerGlobal) {
      this.observerGlobal.disconnect();
      this.observerGlobal = null;
      document.body.style.border = '1px solid orange';
    }
  }

  async handleQuestionChange() {
    const question = getXPathElement('QUESTION_XPATH').innerText;
    Logger.log(`❓ ~ A question has been detected : "${question}"`);

    startTimer();
    const divTextAnswerGPT = document.querySelector('#divTextAnswerGPT');
    divTextAnswerGPT.innerText = ' ';
    const divMiddleHeaderGpt = document.querySelector('#divMiddleHeaderGpt');
    divMiddleHeaderGpt.innerText = MESSAGES.REQUEST_IN_PROGRESS;

    const result = await requestGPT(question, this.hint);
    divMiddleHeaderGpt.innerText = this.hint ? MESSAGES.HINT_RECEIVED : MESSAGES.RESPONSE_RECEIVED;
    divTextAnswerGPT.innerText = result;

    // Hint mode = cant copy
    this.canCopy = !this.hint;
  }

  handleDOMChange(records) {
    // If the DOM change is not related to a question, we return
    if (!records.some((record) => record.target?.innerText?.includes('Question'))) return;

    // Show the records if you want to understand the DOM changes
    //console.log(records);

    if (observerConditions.isNewGame(records)) {
      Logger.log('🔄❓ ~ Question detected (new game).');

      if (!document.querySelector('#divGPT')) {
        createAnswerDiv();
        document.querySelector('#divGPT').addEventListener('click', () => this.insertAnswerGPT());
      }
      this.handleQuestionChange();
      return;
    }

    if (observerConditions.isNewQuestion(records)) {
      Logger.log('🔄❓ ~ Question detected (same game).');

      if (!document.querySelector('#divGPT')) {
        createAnswerDiv();
        document.querySelector('#divGPT').addEventListener('click', () => this.insertAnswerGPT());
      }
      this.handleQuestionChange();
      return;
    }

    if (observerConditions.isNewAnswer(records)) {
      Logger.log('🔄📝 ~ Answer detected.');

      this.canCopy = false;
      return;
    }
  }

  insertAnswerGPT() {
    var answerGPT = document.querySelector('#divTextAnswerGPT').innerText.trim();
    const input = getXPathElement('INPUT_XPATH');
    if (input && this.canCopy && answerGPT != '' && !Object.values(MESSAGES).includes(answerGPT)) {
      input?.focus();
      simulateTyping(input, answerGPT, 0, this.autosubmit);
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

const scriptManager = new ScriptManager();
