'use strict';

import './popup.css';

// When openning the popup, fetch all the settings from the background
chrome.runtime.sendMessage(
  {
    message: 'status',
  },
  (response) => {
    document.getElementById('enabled-input').checked = response.enabled;
    document.getElementById('hint-input').checked = response.hint;
    document.getElementById('autoinsertanswer-input').checked = response.autoinsertanswer;
    document.getElementById('autosubmit-input').checked = response.autosubmit;
    document.getElementById('autosubmitdelaymin-input').value = response.autosubmitdelaymin;
    document.getElementById('autosubmitdelaymax-input').value = response.autosubmitdelaymax;
    document.getElementById('autosubmitdelaymin-value').innerText = response.autosubmitdelaymin;
    document.getElementById('autosubmitdelaymax-value').innerText = response.autosubmitdelaymax;
    document.getElementById('typingdelay-input').value = response.typingdelay;
    document.getElementById('typingdelay-value').innerText = response.typingdelay;

    document.getElementById('apikey-input').value = response.apikey;
  }
);

// When switching the button, send a message to the background to save the new value
document.getElementById('enabled-input').addEventListener('change', function () {
  chrome.runtime.sendMessage({
    message: 'enabled',
    value: this.checked,
  });
});

document.getElementById('hint-input').addEventListener('change', function () {
  chrome.runtime.sendMessage({
    message: 'hint',
    value: this.checked,
  });
});

document.getElementById('autoinsertanswer-input').addEventListener('click', function () {
  chrome.runtime.sendMessage({
    message: 'autoinsertanswer',
    value: this.checked,
  });
});

document.getElementById('autosubmit-input').addEventListener('change', function () {
  chrome.runtime.sendMessage({
    message: 'autosubmit',
    value: this.checked,
  });
});

const autosubmitdelayminInput = document.getElementById('autosubmitdelaymin-input');
const autosubmitdelaymaxInput = document.getElementById('autosubmitdelaymax-input');
const autosubmitdelayminValue = document.getElementById('autosubmitdelaymin-value');
const autosubmitdelaymaxValue = document.getElementById('autosubmitdelaymax-value');

// Update the displayed value as the user drags the slider
autosubmitdelayminInput.addEventListener('input', function () {
  if (parseFloat(autosubmitdelaymaxInput.value) < parseFloat(this.value)) {
    autosubmitdelaymaxInput.value = this.value;
    autosubmitdelaymaxValue.innerText = this.value;
  }

  autosubmitdelayminValue.innerText = this.value;
});
autosubmitdelaymaxInput.addEventListener('input', function () {
  if (parseFloat(autosubmitdelayminInput.value) > parseFloat(this.value)) {
    autosubmitdelayminInput.value = this.value;
    autosubmitdelayminValue.innerText = this.value;
  }

  autosubmitdelaymaxValue.innerText = this.value;
});

const updateAutosubmitDelay = () => {
  chrome.runtime.sendMessage({
    message: 'autosubmitdelaymin',
    value: autosubmitdelayminInput.value,
  });
  chrome.runtime.sendMessage({
    message: 'autosubmitdelaymax',
    value: autosubmitdelaymaxInput.value,
  });
};

autosubmitdelayminInput.addEventListener('change', updateAutosubmitDelay);
autosubmitdelaymaxInput.addEventListener('change', updateAutosubmitDelay);

document.getElementById('typingdelay-input').addEventListener('input', function () {
  document.getElementById('typingdelay-value').innerText = this.value;
});

document.getElementById('typingdelay-input').addEventListener('change', function () {
  chrome.runtime.sendMessage({
    message: 'typingdelay',
    value: this.value,
  });
});

document.getElementById('apikey-input').addEventListener('change', function () {
  chrome.runtime.sendMessage({
    message: 'apikey',
    value: this.value,
  });
});
