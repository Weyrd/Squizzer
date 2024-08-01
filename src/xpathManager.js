import Logger from "./logger";

class XPathManager {
  constructor() {}

  checkIfPartiePerso() {
    const element = this.getElementByXpath(
      "/html/body/div[1]/div/div/div[2]/div/div/div[3]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[1]/div[1]/div/div[1]/div[1]"
    );
    return element?.innerText === "CODE:";
  }

  getXpaths() {
    return this.checkIfPartiePerso()
      ? this.getXPathPartiePerso()
      : this.getXPathNormal();
  }

  getXPathPartiePerso() {
    return {
      QUESTION_XPATH:
        "/html/body/div[1]/div/div/div[2]/div/div/div[3]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[1]/div[1]/div[2]",
      GAME_XPATH:
        "/html/body/div[1]/div/div/div[2]/div/div/div[3]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[1]",
      INPUT_XPATH:
        "/html/body/div[1]/div/div/div[2]/div/div/div[3]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[5]/input",
      APPEND_XPATH:
        "/html/body/div[1]/div/div/div[2]/div/div/div[3]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[2]",
      ANSWER_XPATH:
        "/html/body/div[1]/div/div/div[2]/div/div/div[3]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[1]/div[2]",
      RESULT_XPATH:
        "/html/body/div[1]/div/div/div[2]/div/div/div[3]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[1]/div[1]/div[1]",
      GLOBAL_XPATH:
        "/html/body"
    };
  }

  getXPathNormal() {
    return {
      QUESTION_XPATH:
        "/html/body/div[1]/div/div/div[2]/div/div/div[2]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[1]/div/div[2]",
      GAME_XPATH:
        "/html/body/div[1]/div/div/div[2]/div/div/div[2]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[1]",
      INPUT_XPATH:
        "/html/body/div[1]/div/div/div[2]/div/div/div[2]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[5]/input",
      APPEND_XPATH:
        "/html/body/div[1]/div/div/div[2]/div/div/div[2]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[2]",
      ANSWER_XPATH:
        "/html/body/div[1]/div/div/div[2]/div/div/div[2]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[1]/div[2]",
      RESULT_XPATH:
        "/html/body/div[1]/div/div/div[2]/div/div/div[2]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[1]/div[1]/div[1]",
      GLOBAL_XPATH:
        "/html/body"
    };
  }

  getElementByXpath(path) {
    return document.evaluate(
      path,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
  }
}

export const xpathManager = new XPathManager();
