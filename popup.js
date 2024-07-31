chrome.tabs.query({}, (tabs) => {
  tabs.forEach((tab) => {
    chrome.tabs.sendMessage(tab.id, "status");
  });
});

document.body.style.border = "1px solid blue";

document.getElementById("switch").addEventListener("change", function () {
  if (this.checked) {
    document.getElementById("switchDesc").innerHTML = "Activé";

    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, "activate");
      });
    });

    localStorage.setItem("switch", "true");
  } else {
    document.getElementById("switchDesc").innerHTML = "Désactivé";

    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, "deactivate");
      });
    });

    localStorage.setItem("switch", "false");
  }
});

if (localStorage.getItem("switch") == "true") {
  document.getElementById("switch").checked = true;
  document.getElementById("switchDesc").innerHTML = "Activé";
} else {
  document.getElementById("switch").checked = false;
  document.getElementById("switchDesc").innerHTML = "Désactivé";
}

// Listen to message from content script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("Message received from content script: " + request);
  if (request == "start") {
    // Reset local storage
    localStorage.setItem("switch", "false");
    document.getElementById("switch").checked = false;
    document.getElementById("switchDesc").innerHTML = "Désactivé";
  }
});

// Uncaught (in promise) Error: Could not establish connection. Receiving end does not exist.
