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
    document.getElementById('autosubmitdelay-input').value = response.autosubmitdelay;
    document.getElementById('autosubmitdelay-value').innerText = response.autosubmitdelay;
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

// Update the displayed value as the user drags the slider
document.getElementById('autosubmitdelay-input').addEventListener('input', function () {
  document.getElementById('autosubmitdelay-value').innerText = this.value;
});

// When the user releases the slider, send a message to the service worker to update the delay
document.getElementById('autosubmitdelay-input').addEventListener('change', function () {
  chrome.runtime.sendMessage({
    message: 'autosubmitdelay',
    value: this.value,
  });
});
