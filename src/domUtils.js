import { MESSAGES, MODEL } from './constants.js';
import Logger from './logger';
import { xpathManager } from './xpathManager.js';

export function getXPathElement(xpathKey) {
  const xpaths = xpathManager.getXpaths();
  return xpathManager.getElementByXpath(xpaths[xpathKey]);
}

export function createAnswerDiv() {
  const divHeaderGpt = document.createElement('div');
  divHeaderGpt.className = 'css-1dbjc4n r-18u37iz';

  const divLeftHeaderGpt = document.createElement('div');
  divLeftHeaderGpt.id = 'divLeftHeaderGpt';
  divLeftHeaderGpt.className = 'css-901oao r-jwli3a r-1mkrsdo r-vw2c0b r-fdjqy7 r-13qz1uu';
  divLeftHeaderGpt.innerText = `Squizzer`;
  divHeaderGpt.appendChild(divLeftHeaderGpt);

  const divMiddleHeaderGpt = document.createElement('div');
  divMiddleHeaderGpt.id = 'divMiddleHeaderGpt';
  divMiddleHeaderGpt.className = 'css-901oao r-jwli3a r-1mkrsdo r-q4m81j r-13qz1uu';
  divMiddleHeaderGpt.innerText = MESSAGES.WAITING_FOR_QUESTION;
  divHeaderGpt.appendChild(divMiddleHeaderGpt);

  const divRightHeaderGpt = document.createElement('div');
  divRightHeaderGpt.id = 'divRightHeaderGpt';
  divRightHeaderGpt.className = 'css-901oao r-jwli3a r-1mkrsdo r-1ff274t r-13qz1uu';
  divRightHeaderGpt.innerText = MODEL;
  divRightHeaderGpt.style.textAlign = 'right';
  divHeaderGpt.appendChild(divRightHeaderGpt);

  const divTextAnswerGPT = document.createElement('div');
  divTextAnswerGPT.id = 'divTextAnswerGPT';
  divTextAnswerGPT.className = 'css-901oao r-jwli3a r-1mkrsdo r-1x35g6 r-tvv088 r-q4m81j r-lrvibr';
  divTextAnswerGPT.innerText = " ";
  divTextAnswerGPT.style.padding = '20px 0';

  const divFooterGpt = document.createElement('div');
  divFooterGpt.id = 'divFooterGpt';
  divFooterGpt.className = 'css-901oao r-jwli3a r-1loqt21 r-6koalj r-1jj8364 r-7xmw5f';
  divFooterGpt.innerText = '';

  const divGPT = document.createElement('div');
  divGPT.id = 'divGPT';
  divGPT.className = 'css-1dbjc4n r-1ksg616 r-1dzdj1l r-1pcd2l5';
  divGPT.appendChild(divHeaderGpt);
  divGPT.appendChild(divTextAnswerGPT);
  divGPT.appendChild(divFooterGpt);
  divGPT.style.backgroundColor = 'rgb(17, 20, 33)';
  divGPT.style.boxShadow = 'rgb(32 74 108) 0px 8px 0px';
  divGPT.style.marginTop = '20px';
  divGPT.style.cursor = 'pointer';
  divGPT.style.width = '100%';
  divGPT.style.marginBottom = '20px';

  getXPathElement('APPEND_XPATH').appendChild(divGPT);

  Logger.log('🛠️📄 ~ Squizzer DOM element created');

  return divTextAnswerGPT;
}

export function startTimer() {
  const startTime = Date.now();
  const divFooterGpt = document.querySelector('#divFooterGpt');

  function update() {
    // Always display the time as a float with one decimal (e.g., 1.0s)
    divFooterGpt.innerText = ((Date.now() - startTime) / 1000).toFixed(1) + 's';
  }

  // Display the time every 100ms for 13 seconds
  for (let i = 0; i <= 130; i++) {
    setTimeout(update, i * 100);
  }
}

export function simulateTyping(input, text, delay, autosubmit, startTime, autosubmitdelay) {
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
      input?.dispatchEvent(event);

      // Append the character to the input field
      input.value += key;

      // Create and dispatch the 'input' event
      const inputEvent = new Event('input', {
        bubbles: true,
      });
      input.dispatchEvent(inputEvent);

      index++;
      setTimeout(typeCharacter, delay); // Recursively type the next character
    } else if (autosubmit) {
      const remainingTime = autosubmitdelay * 1000 - (Date.now() - startTime) - 46;
      setTimeout(() => {
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
      }, remainingTime);
    }
  }
  typeCharacter();
}
