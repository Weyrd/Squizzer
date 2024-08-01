'use strict';

import Logger from './logger';
import { MESSAGES } from './constants';
import { requestGPT } from './openAI';
import { getXPathElement, createAnswerDiv } from './domUtils';

class ScriptManager {
  constructor() {
    this.observer = null;
  }

  createObserver(targetElement) {
    this.observer = new MutationObserver(this.handleQuestionChange.bind(this));
    this.observer.observe(targetElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    document.body.style.border = '1px solid green';
  }

  removeObserver() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
      document.body.style.border = '1px solid orange';
    }
  }

  async handleQuestionChange() {
    Logger.log(
      '[DEBUG] A change has been detected by the observer in the parent div'
    );

    const current_question = getXPathElement('QUESTION_XPATH');

    const reponse = getXPathElement('ANSWER_XPATH');
    if (
      !reponse &&
      current_question &&
      current_question.innerText !== MESSAGES.GAME_STARTING
    ) {
      Logger.log(
        `[DEBUG] A question has been detected : "${current_question.innerText}"`
      );

      const divTextAnswerGPT = document.querySelector('#divTextAnswerGPT');
      divTextAnswerGPT.innerText = MESSAGES.REQUEST_IN_PROGRESS;

      const result = await requestGPT(current_question.innerText);
      divTextAnswerGPT.innerText = result;
    }
  }

  start() {
    Logger.log('[DEBUG] Starting the script');
    document.body.style.border = '1px solid orange';
    document.body.style.boxSizing = 'border-box';

    const parentDiv = getXPathElement('PARENT_XPATH');
    Logger.log('[DEBUG] Fetched the parent div from the DOM :', parentDiv);
    this.createObserver(parentDiv);

    if (!document.querySelector('#divGPT')) createAnswerDiv();
  }

  stop() {
    Logger.log('[DEBUG] Stopping the script');
    this.removeObserver();
    document.body.style.border = 'none';
    const divGPT = document.querySelector('#divGPT');
    if (divGPT) divGPT.remove();
  }
}

const scriptManager = new ScriptManager();

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === 'start') {
    scriptManager.start();
  } else if (request.message === 'stop') {
    scriptManager.stop();
  }
});
