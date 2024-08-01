import { MESSAGES } from './constants.js';
import Logger from './logger';
import { xpathManager } from './xpathManager.js';

export function getXPathElement(xpathKey) {
  const xpaths = xpathManager.getXpaths();
  return xpathManager.getElementByXpath(xpaths[xpathKey]);
}


export function createAnswerDiv() {
  Logger.log('🛠️ ~ Creating the divGPT');

  const divTextAnswerGPT = document.createElement('div');
  divTextAnswerGPT.id = 'divTextAnswerGPT';
  divTextAnswerGPT.className =
    'css-901oao r-jwli3a r-1mkrsdo r-1x35g6 r-10x3wzx r-q4m81j r-lrvibr';

  const divGPT = document.createElement('div');
  divGPT.id = 'divGPT';
  divGPT.className = 'css-1dbjc4n r-1ksg616 r-1dzdj1l r-1pcd2l5';
  divGPT.appendChild(divTextAnswerGPT);
  divGPT.style.backgroundColor = 'rgb(17, 20, 33)';
  divGPT.style.boxShadow = 'rgb(32 74 108) 0px 8px 0px';
  divGPT.style.marginTop = '20px';
  divGPT.style.cursor = 'pointer';
  divGPT.style.width = '100%';
  divGPT.style.marginBottom = '20px';

  divTextAnswerGPT.innerHTML = MESSAGES.WAITING_FOR_QUESTION;

  getXPathElement('APPEND_XPATH').appendChild(divGPT);

  return divTextAnswerGPT;
}

export function simulateTyping(input, text, delay, pressEnter) {
  let index = 0;

  function typeCharacter() {
    if (index < text.length) {
      const key = text[index];
      const event = new KeyboardEvent('keydown', {
        key: key,
        code: key.charCodeAt(0),
        keyCode: key.charCodeAt(0),
        which: key.charCodeAt(0),
        bubbles: true,
        cancelable: true,
      });

      // Dispatch keydown event
      input.dispatchEvent(event);

      // Append the character to the input field
      input.value += key;

      // Create and dispatch the 'input' event
      const inputEvent = new Event('input', {
        bubbles: true,
      });
      input.dispatchEvent(inputEvent);

      index++;
      setTimeout(typeCharacter, delay); // Recursively type the next character
    } else if (pressEnter) {
      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true,
      });

      // Dispatch keydown event
      input.dispatchEvent(event);
    }
  }
  typeCharacter();
}


