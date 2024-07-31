const MESSAGES = {
  REQUEST_IN_PROGRESS: "Requête en cours...",
  CONNECTION_ERROR: "Erreur de connexion à GPT",
  CODE_ERROR: "Erreur dans le code: ",
  EMPTY_RESPONSE: "La réponse est vide.",
  RESPONSE_RECEIVED: "Réponse : ",
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

const OPENAI_API_KEY = ""
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

var question = getElementByXpath(QUESTION_XPATH);
var observer;
var parent;
var divGPT;
var divAnswerGPT;
var answerGPT;

function createDiv() {
  parent = getElementByXpath(PARENT_XPATH);

  divGPT = document.createElement("div");
  divGPT.id = "divGPT";
  divGPT.className = "css-1dbjc4n r-1ksg616 r-1dzdj1l r-1pcd2l5";
  divGPT.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
  divAnswerGPT = document.createElement("div");
  divAnswerGPT.className =
    "css-901oao r-jwli3a r-1mkrsdo r-1x35g6 r-10x3wzx r-q4m81j r-lrvibr";
  divGPT.appendChild(divAnswerGPT);
  divGPT.style.backgroundColor = "rgb(17, 20, 33)";
  divGPT.style.boxShadow = "rgb(32 74 108) 0px 8px 0px";
  divGPT.style.marginTop = "20px";
  divGPT.style.cursor = "pointer";

  document.body.style.border = "1px solid green";
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
    const answer = data.choices[0].message.content.trim();
    try {
      responseGPT(answer);
    } catch (err) {
      console.error(err);
      divAnswerGPT.innerText = MESSAGES.CODE_ERROR + err;
    }
  } catch (err) {
    console.error(err);
    divAnswerGPT.innerText = MESSAGES.CONNECTION_ERROR;
  }
}

function responseGPT(response) {
  // strip all special characters but keep spaces
  answerGPT = response.replace(/[^\S ]+/g, "");
  console.log(MESSAGES.RESPONSE_RECEIVED + answerGPT);

  //add the answer to the input css-11aywtz r-jwli3a r-16y2uox r-1mkrsdo r-1x35g6 r-t66pp7 r-10paoce
  divAnswerGPT.innerHTML = MESSAGES.RESPONSE_RECEIVED + answerGPT;

  insertAnswerGPT();
}

function requestApi() {
  if (!document.querySelector("#divGPT")) parent.appendChild(divGPT);
  //reset the answer
  answerGPT = "";
  divAnswerGPT.innerText = MESSAGES.REQUEST_IN_PROGRESS;
  requestGPT();
}

// if div question exist and != MESSAGES.GAME_STARTING start main() else retry until it exist
function start() {
  getXPath();
  question = getElementByXpath(QUESTION_XPATH);
  console.log("Fetched the question div from the DOM :", question);
  document.body.style.border = "1px solid orange";
  if (question && question.innerText != MESSAGES.GAME_STARTING) {
    console.log(`A question has been detected : "${question.innerText}`);

    createDiv();
    requestApi();

    // get everytime the div changes and execute the function "test" (obeserve only "var question" div) config in observer.observe below
    observer = new MutationObserver(requestApi);
    observer.observe(question, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    // add onclick event to the two div
    divGPT.addEventListener("click", insertAnswerGPT);

    divAnswerGPT.innerText = MESSAGES.REQUEST_IN_PROGRESS;
  } else {
    setTimeout(start, 1000);
  }
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
      const inputEvent = new Event("input", { bubbles: true });
      input.dispatchEvent(inputEvent);

      index++;
      setTimeout(typeCharacter, delay); // Recursively type the next character
    } else {
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
  if (answerGPT != "") {
    input = getElementByXpath(INPUT_XPATH);
    input.focus();

    const isRightClick = e?.which == 3 || e?.which == 2;
    simulateTyping(input, answerGPT, 0, !isRightClick);
  }
}

document.body.style.border = "1px solid orange";
document.body.style.boxSizing = "border-box";

chrome.runtime.onMessage.addListener((data) => {
  console.log("Received message from popup:", data);
  if (data == "activate") {
    start();
  } else if (data == "deactivate") {
    observer.disconnect();
    parent.removeChild(divGPT);
  } else if (data == "status") {
    console.log("Observer:", observer);
    chrome.runtime.sendMessage(
      observer == undefined || observer.takeRecords().length == 0
        ? "inactive"
        : "active"
    );
  }
});

start();
