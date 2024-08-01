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
    if (response.hint) {
      document.getElementById('hint-input').checked = true;
    }
  }
);

// When switching the button, send a message to the service worker to update the status of the extension
document
  .getElementById('enabled-input')
  .addEventListener('change', function () {
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
