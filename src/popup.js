'use strict';

import './popup.css';

// Cache DOM elements
const elements = {
  enabledInput: document.getElementById('enabled-input'),
  hintInput: document.getElementById('hint-input'),
  autoinsertanswerInput: document.getElementById('autoinsertanswer-input'),
  autosubmitInput: document.getElementById('autosubmit-input'),
  autosubmitdelayminInput: document.getElementById('autosubmitdelaymin-input'),
  autosubmitdelaymaxInput: document.getElementById('autosubmitdelaymax-input'),
  autosubmitdelayminValue: document.getElementById('autosubmitdelaymin-value'),
  autosubmitdelaymaxValue: document.getElementById('autosubmitdelaymax-value'),
  typingdelayInput: document.getElementById('typingdelay-input'),
  typingdelayValue: document.getElementById('typingdelay-value'),
  apikeyInput: document.getElementById('apikey-input'),
  noblurInput: document.getElementById('noblur-input'),
};

// Fetch settings from the background when opening the popup
chrome.runtime.sendMessage({ message: 'status' }, (response) => {
  elements.enabledInput.checked = response.enabled;
  elements.hintInput.checked = response.hint;
  elements.autoinsertanswerInput.checked = response.autoinsertanswer;
  elements.autosubmitInput.checked = response.autosubmit;
  elements.autosubmitdelayminInput.value = response.autosubmitdelaymin;
  elements.autosubmitdelaymaxInput.value = response.autosubmitdelaymax;
  elements.autosubmitdelayminValue.innerText = response.autosubmitdelaymin;
  elements.autosubmitdelaymaxValue.innerText = response.autosubmitdelaymax;
  elements.typingdelayInput.value = response.typingdelay;
  elements.typingdelayValue.innerText = response.typingdelay;
  elements.apikeyInput.value = response.apikey;
  elements.noblurInput.checked = response.noblur;
});

// Generic function to send a message
const sendMessage = (message, value) => {
  chrome.runtime.sendMessage({ message, value });
};

// Add event listeners using event delegation
document.addEventListener('change', (event) => {
  const { id, value, checked } = event.target;

  switch (id) {
    case 'enabled-input':
      sendMessage('enabled', checked);
      break;
    case 'hint-input':
      sendMessage('hint', checked);
      break;
    case 'autoinsertanswer-input':
      sendMessage('autoinsertanswer', checked);
      break;
    case 'autosubmit-input':
      sendMessage('autosubmit', checked);
      break;
    case 'autosubmitdelaymin-input':
    case 'autosubmitdelaymax-input':
      updateAutosubmitDelay();
      break;
    case 'typingdelay-input':
      elements.typingdelayValue.innerText = value;
      sendMessage('typingdelay', value);
      break;
    case 'apikey-input':
      sendMessage('apikey', value);
      break;
    case 'noblur-input':
      sendMessage('noblur', checked);
      break;
  }
});

// Update the displayed value as the user drags the slider
const updateAutosubmitDelay = () => {
  const minVal = parseFloat(elements.autosubmitdelayminInput.value);
  const maxVal = parseFloat(elements.autosubmitdelaymaxInput.value);
  sendMessage('autosubmitdelaymin', minVal);
  sendMessage('autosubmitdelaymax', maxVal);
};

elements.autosubmitdelayminInput.addEventListener('input', function () {
  if (parseFloat(elements.autosubmitdelaymaxInput.value) < parseFloat(this.value)) {
    elements.autosubmitdelaymaxInput.value = this.value;
    elements.autosubmitdelaymaxValue.innerText = this.value;
  }

  elements.autosubmitdelayminValue.innerText = this.value;
});
elements.autosubmitdelaymaxInput.addEventListener('input', function () {
  if (parseFloat(elements.autosubmitdelayminInput.value) > parseFloat(this.value)) {
    elements.autosubmitdelayminInput.value = this.value;
    elements.autosubmitdelayminValue.innerText = this.value;
  }

  elements.autosubmitdelaymaxValue.innerText = this.value;
});

// Add input event listener for immediate typing delay feedback
elements.typingdelayInput.addEventListener('input', (event) => {
  elements.typingdelayValue.innerText = event.target.value;
});
