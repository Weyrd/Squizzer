'use strict';

import './popup.css';

// When openning the popup, get the current status of the extension (enabled or not)
chrome.runtime.sendMessage(
  {
    message: 'status',
  },
  (response) => {
    if (response.enabled) {
      document.getElementById('enabled-label').innerText = 'Activé';
      document.getElementById('enabled-input').checked = true;
    }

    document.getElementById('hint-input').checked = response.hint;
    document.getElementById('autoinsertanswer-input').checked = response.autoinsertanswer;
    document.getElementById('autosubmit-input').checked = response.autosubmit;
    document.getElementById('autosubmitdelaymin-input').value = response.autosubmitdelaymin;
    document.getElementById('autosubmitdelaymax-input').value = response.autosubmitdelaymax;
    document.getElementById('autosubmitdelaymin-value').innerText = response.autosubmitdelaymin;
    document.getElementById('autosubmitdelaymax-value').innerText = response.autosubmitdelaymax;
  }
);

// When switching the button, send a message to the service worker to update the status of the extension
document.getElementById('enabled-input').addEventListener('change', function () {
  if (this.checked) {
    document.getElementById('enabled-label').innerText = 'Activé';
  } else {
    document.getElementById('enabled-label').innerText = 'Désactivé';
  }

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

// When the user releases the slider, send a message to the service worker to update the delay
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
