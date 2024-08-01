'use strict';

import './popup.css';

// When openning the popup, get the current status of the extension (enabled or not)
chrome.runtime.sendMessage(
  {
    message: 'status',
  },
  (response) => {
    if (response.enabled) {
      document.getElementById('switchText').innerHTML = 'Activé';
      document.getElementById('switch').checked = true;
    }
  }
);

// When switching the button, send a message to the service worker to update the status of the extension
document.getElementById('switch').addEventListener('change', function () {
  if (this.checked) {
    document.getElementById('switchText').innerHTML = 'Activé';

    chrome.runtime.sendMessage({
      message: 'enable',
    });
  } else {
    document.getElementById('switchText').innerHTML = 'Désactivé';

    chrome.runtime.sendMessage({
      message: 'disable',
    });
  }
});
