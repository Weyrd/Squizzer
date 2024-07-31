const MESSAGES = {
  REQUEST_IN_PROGRESS: "Requête en cours...",
  CONNECTION_ERROR: "Erreur de connexion à GPT",
  CODE_ERROR: "Erreur dans le code: ",
  EMPTY_RESPONSE: "La réponse est vide.",
  RESPONSE_RECEIVED: "Réponse : ",
  WAITING_FOR_QUESTION: "En attente d'une question...",
  GAME_STARTING: "La partie va bientôt commencer",
};

const PROMPT = `Tu es un super champion de Question Pour un champion. 
Tu as gagné des centaines de fois et tu es la personne la plus cultivée dans tous les differents domaines au monde. 
Pour ce quizz tu dois suivre des règles strictes.
- Pas de ponctuations, ni de majuscules ni d'accent.
- Si on te demande un nombre, réponds toujours en chiffres sans texte (example: écrit "6" pas "six"). Parfois tu devras rajouter "ans", "mètres" ou l'unité à la fin.
- Répond en 5 mots maximum.
- Si tu peux répondre en un seul mot, c'est encore mieux.
- Si tu ne connais pas la réponse, réponds "Je ne sais pas".
- Si tu dois compléter une phrase, réponds uniquement avec le ou les mots manquant. Ne pas réécrire la phrase entière.
    (Example : Quand on est malade on à une fièvre de... Réponds "cheval")
- Si on te demande des questions sur des titres japonais, essaye de trouver le titrer francais si possible. Sinon réponds romaji.
`;

const OPENAI_API_KEY =
  "";

var isPartiePerso;
var QUESTION_XPATH;
var PARENT_XPATH;
var INPUT_XPATH;

function getXPath() {
  isPartiePerso =
    getElementByXpath(
      "/html/body/div[1]/div/div/div[2]/div/div/div[3]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[1]/div[1]/div/div[1]/div[1]"
    )?.innerText == "CODE:";
  console.log("Partie perso: ", isPartiePerso);

  QUESTION_XPATH = isPartiePerso
    ? "/html/body/div[1]/div/div/div[2]/div/div/div[3]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[1]/div[1]/div[2]"
    : "/html/body/div[1]/div/div/div[2]/div/div/div[2]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[1]/div/div[2]";
  PARENT_XPATH = isPartiePerso
    ? "/html/body/div[1]/div/div/div[2]/div/div/div[3]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[1]"
    : "/html/body/div[1]/div/div/div[2]/div/div/div[2]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[1]";
  INPUT_XPATH = isPartiePerso
    ? "/html/body/div[1]/div/div/div[2]/div/div/div[3]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[5]/input"
    : "/html/body/div[1]/div/div/div[2]/div/div/div[2]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[5]/input";
  APPEND_XPATH = isPartiePerso
    ? "/html/body/div[1]/div/div/div[2]/div/div/div[3]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[2]"
    : "/html/body/div[1]/div/div/div[2]/div/div/div[2]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[2]";
  ANSWER_XPATH = isPartiePerso
    ? "/html/body/div[1]/div/div/div[2]/div/div/div[3]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[1]/div[2]"
    : "/html/body/div[1]/div/div/div[2]/div/div/div[2]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[1]/div[2]";
}

function getElementByXpath(path) {
  return document.evaluate(
    path,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
}

var question;
var observer;
var parent;
var divGPT;
var divTextAnswerGPT;

function createDiv() {
  console.log("Creating the divGPT");
  divGPT = document.createElement("div");
  divGPT.id = "divGPT";
  divGPT.className = "css-1dbjc4n r-1ksg616 r-1dzdj1l r-1pcd2l5";
  divTextAnswerGPT = document.createElement("div");
  divTextAnswerGPT.className =
    "css-901oao r-jwli3a r-1mkrsdo r-1x35g6 r-10x3wzx r-q4m81j r-lrvibr";
  divGPT.appendChild(divTextAnswerGPT);
  divGPT.style.backgroundColor = "rgb(17, 20, 33)";
  divGPT.style.boxShadow = "rgb(32 74 108) 0px 8px 0px";
  divGPT.style.marginTop = "20px";
  divGPT.style.cursor = "pointer";
  divGPT.style.width= "100%";
  divGPT.style.marginBottom = "20px";
  
  divTextAnswerGPT.innerHTML = MESSAGES.WAITING_FOR_QUESTION;
  
  getElementByXpath(APPEND_XPATH).appendChild(divGPT);
  

  // add onclick event to the two div
  divGPT.addEventListener("click", insertAnswerGPT);
}

async function requestGPT() {
  console.log(`Sending the question to ChatGPT: "${question.innerText}"`);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: PROMPT,
          },
          {
            role: "user",
            content: question.innerText,
          },
        ],
        temperature: 0,
        max_tokens: 30,
      }),
    });

    const data = await response.json();
    // this regex remove tab, new line etc from the answer but do not remove space
    const answer = data.choices[0].message.content
      .trim()
      .replace(/[^\S ]+/g, "");
    try {
      if (answer.length > 0) {
        return MESSAGES.RESPONSE_RECEIVED + answer;
      } else {
        return MESSAGES.EMPTY_RESPONSE;
      }
    } catch (err) {
      console.error(err);
      return MESSAGES.CODE_ERROR + err;
    }
  } catch (err) {
    console.error(err);
    return MESSAGES.CONNECTION_ERROR;
  }
}

// Function to create and configure the MutationObserver
function createObserver(targetElement) {
  observer = new MutationObserver(handleQuestionChange);

  observer.observe(targetElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  document.body.style.border = "1px solid green";
}

function removeObserver() {
  observer?.disconnect(); // Stop observing
  document.body.style.border = "1px solid orange";
}

async function handleQuestionChange() {
  console.log("A change has been detected by the observer in the parent div");
  question = getElementByXpath(QUESTION_XPATH);
  reponse = getElementByXpath(ANSWER_XPATH);
  if (!reponse && !!question && question.innerText != MESSAGES.GAME_STARTING) {
    console.log(`A question has been detected : "${question.innerText}`);

    answerGPT = "";
    divTextAnswerGPT.innerText = MESSAGES.REQUEST_IN_PROGRESS;

    result = await requestGPT();
    divTextAnswerGPT.innerText = result;
  }
}

// start is handlle by the service worker
function start() {
  console.log("Starting the script");
  document.body.style.border = "1px solid orange";
  document.body.style.boxSizing = "border-box";
  getXPath();
  parent = getElementByXpath(PARENT_XPATH);
  console.log("Fetched the parent div from the DOM :", question);
  createObserver(parent);
  if (!document.querySelector("#divGPT")) createDiv();
}

function stop() {
  console.log("Stoping the script");
  document.body.style.border = "none";
  removeObserver();
  if (document.querySelector("#divGPT")) document.querySelector("#divGPT").remove();
}

function simulateTyping(input, text, delay, pressEnter) {
  let index = 0;

  function typeCharacter() {
    if (index < text.length) {
      const key = text[index];
      const event = new KeyboardEvent("keydown", {
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
      const inputEvent = new Event("input", {
        bubbles: true,
      });
      input.dispatchEvent(inputEvent);

      index++;
      setTimeout(typeCharacter, delay); // Recursively type the next character
    } else if (pressEnter) {
      const event = new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
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

// insertAnswerGPT
function insertAnswerGPT(e) {
  var answerGPT = divTextAnswerGPT.innerText.replace(MESSAGES.RESPONSE_RECEIVED, "").trim();
  if (answerGPT != "") {
    input = getElementByXpath(INPUT_XPATH);
    input.focus();

    const isRightClick = e?.which == 3 || e?.which == 2;
    simulateTyping(input, answerGPT, 0, !isRightClick);
  }
}

chrome.runtime.onMessage.addListener(function (request) {
  if (request.message === "start") {
    console.log("Start content script");
    // Waiting for all the DOM to be ready (especially in custom games)
    setTimeout(start, 500);
  }
  if (request.message === "stop") {
    console.log("Stop content script");
    stop();
  }
});
