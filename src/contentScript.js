'use strict';

import Logger from './logger';
import { MESSAGES } from './constants';
import { requestGPT } from './openAI';
import { getXPathElement, createAnswerDiv, simulateTyping } from './domUtils';

class ScriptManager {
  constructor() {
    this.observerGame = null;
    this.observerGlobal = null;
    this.hint = false;
    this.canCopy = true;
    this.autosubmit = false;
    this.timer = 0;

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

  createObserverGlobal(targetElement) {
    this.observerGlobal = new MutationObserver(this.handleDOMChangeGlobal.bind(this));
    this.observerGlobal.observe(targetElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    document.body.style.border = '1px solid purple';
  }
  createObserverGame(targetElement) {
    this.observerGame = new MutationObserver(this.handleDOMChangeGame.bind(this));
    this.observerGame.observe(targetElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    document.body.style.border = '1px solid green';
  }

  removeObserverGame() {
    if (this.observerGame) {
      this.observerGame.disconnect();
      this.observerGame = null;
      document.body.style.border = '1px solid orange';
    }
  }

  removeObserverGlobal() {
    if (this.observerGlobal) {
      this.observerGlobal.disconnect();
      this.observerGlobal = null;
      document.body.style.border = '1px solid orange';
    }
  }

  async handleQuestionChange(question) {
    Logger.log(`❓ ~ A question has been detected : "${question}"`);
    this.timer = Date.now();

    const divTextAnswerGPT = document.querySelector('#divTextAnswerGPT');
    divTextAnswerGPT.innerText = MESSAGES.REQUEST_IN_PROGRESS;

    const result = await requestGPT(question, this.hint);
    divTextAnswerGPT.innerText = result;

    // Hint mode = cant copy
    this.canCopy = !this.hint;
  }

  handleDOMChangeGame() {
    Logger.log('🔄 ~ A change has been detected by the observer in the DOM near the question');

    const question = getXPathElement('QUESTION_XPATH');

    const response = getXPathElement('ANSWER_XPATH');

    // pas de div reponse + div question + pas de la game n'a pas encore start
    const isQuestion = !response && question && question.innerText !== MESSAGES.GAME_STARTING;

    if (isQuestion) {
      this.handleQuestionChange(question.innerText);
    }
    // else if we are in the answer time (div updated but not a new question)
    else if (response) {
      this.canCopy = false;
      this.timer = 0;
    }
  }

  handleDOMChangeGlobal() {
    //create the game observer when needed
    const question = getXPathElement('QUESTION_XPATH');
    const result = getXPathElement('RESULT_XPATH');
    Logger.log('🔄🌍 ~ A change has been detected by the global observer in the DOM.');
    Logger.log(`🔄🌍 ~ Question: ${question?.innerText}`);
    Logger.log(`🔄🌍 ~ Result: ${result?.innerText}`);

    if (question && result?.innerText !== MESSAGES.RESULT_SCREEN && !this.observerGame) { 
      Logger.log('🎮 ~ The game is starting, creating the game observer');

      this.createObserverGame(getXPathElement('GAME_XPATH'));
      if (!document.querySelector('#divGPT')) createAnswerDiv();
      document.querySelector('#divGPT').addEventListener('click', () => this.insertAnswerGPT());
    } else if (!result  && this.observerGame) {
      // && question?.innerText === MESSAGES.RESULT_SCREEN
      Logger.log('🏁 ~ The game is finished, removing the game observer');
      this.removeObserverGame();
    }
  }

  insertAnswerGPT(e) {
    var answerGPT = document
      .querySelector('#divTextAnswerGPT')
      .innerText.replace(MESSAGES.RESPONSE_RECEIVED, '')
      .trim();
    const input = getXPathElement('INPUT_XPATH');
    if (input && this.canCopy && answerGPT != '' && !Object.values(MESSAGES).includes(answerGPT)) {
      input?.focus();
      simulateTyping(input, answerGPT, 0, this.autosubmit);
    }
  }

  start() {
    document.body.style.border = '1px solid orange';
    document.body.style.boxSizing = 'border-box';

    const globalDiv = getXPathElement('GLOBAL_XPATH');
    Logger.log('📦 ~ Fetched the Global div from the DOM :', globalDiv);
    this.createObserverGlobal(globalDiv);
  }

  stop() {
    this.removeObserverGame();
    this.removeObserverGlobal();
    document.body.style.border = 'none';
    const divGPT = document.querySelector('#divGPT');
    if (divGPT) divGPT.remove();
  }
}

const scriptManager = new ScriptManager();
