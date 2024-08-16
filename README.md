# <img src="public/icons/icon_48.png" width="45" align="left"> Squizzer

**A Chrome extension to help you win some [sQuiz](https://sQuiz.gg) games 🥇**

## Set up

To get started with Squizzer, follow these steps:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/Weyrd/Squizzer.git
    cd Squizzer
    npm install
    ```
2. **Create `secrets.js`**:
    - In the `src` folder, create a file named `secrets.js` with the following content:
    ```js
    export const OPENAI_API_KEY = 'your_openai_api_key';
    ```
3. **Run the app in development mode**:
    ```bash
    npm run watch
    ```
4. **Load the extension in Chrome**:
    - Open `chrome://extensions` in Chrome.
    - Enable "Developer mode" by checking the checkbox in the top right corner.
    - Click on the "Load unpacked extension" button.
    - Select the `Squizzer/build` folder.

## Features

<p align="center">
<img src="https://github.com/user-attachments/assets/324720e9-48e6-4fc9-b978-0d164de722f5">
</p>

Once the extension is installed, you can take advantage of the following features:

- **Enable/Disable**: Toggle the extension on or off. When enabled, it observes the web page for any question created in the DOM. Detected questions are sent to the OpenAI API to determine the answer. The result is presented to you, and you can left-click on it to insert the answer into the text input. 

- **Automatically insert the answer**: If enabled, the extension automatically inserts the answer into the text input, allowing you to simply press enter to submit your answer.

- **Automatically submit the answer**: When activated, the extension automatically submits (i.e., presses the enter key) the answer once it is inserted into the text input. This can be combined with the automatic insertion feature.

- **Delay before automatic submission**: Set a minimum and maximum delay after which the answer will be automatically submitted. If the delay is shorter than the response time of the OpenAI API, the answer will be submitted as soon as possible.  
⚠️ This may appear suspicious if you play against other people, as your answer time will be displayed to everyone and it is uncommon to answer any question in under 1.5 seconds.

- **Delay between each key stroke**: Set a delay between each key stroke when inserting the answer into the text input. This can be used to simulate a more human-like typing speed.

- **[Experimental] Only display a hint**: Instead of providing a direct answer, the extension can offer a hint to help you answer the question.  
⚠️ This feature is experimental and may not work as expected.

## Install

You can install the Squizzer **Chrome** extension [here]() <!-- TODO: Add Chrome extension link inside the parenthesis -->

---

This project was bootstrapped with [Chrome Extension CLI](https://github.com/dutiyesh/chrome-extension-cli).

Made with ❤️ by [Weyrd](https://github.com/Weyrd) & [Dyrudis](https://github.com/Dyrudis)
