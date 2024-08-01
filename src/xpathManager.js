class XPathManager {
  constructor() {
    this.isPartiePerso = this.checkIfPartiePerso();
  }

  checkIfPartiePerso() {
    const element = this.getElementByXpath(
      '/html/body/div[1]/div/div/div[2]/div/div/div[3]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[1]/div[1]/div/div[1]/div[1]'
    );
    return element?.innerText === 'CODE:';
  }

  getXpaths() {
    return this.isPartiePerso
      ? this.getXPathPartiePerso()
      : this.getXPathNormal();
  }

  getXPathPartiePerso() {
    return {
      QUESTION_XPATH:
        '/html/body/div[1]/div/div/div[2]/div/div/div[3]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[1]/div[1]/div[2]',
      PARENT_XPATH:
        '/html/body/div[1]/div/div/div[2]/div/div/div[3]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[1]',
      INPUT_XPATH:
        '/html/body/div[1]/div/div/div[2]/div/div/div[3]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[5]/input',
      APPEND_XPATH:
        '/html/body/div[1]/div/div/div[2]/div/div/div[3]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[2]',
      ANSWER_XPATH:
        '/html/body/div[1]/div/div/div[2]/div/div/div[3]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[1]/div[2]',
    };
  }

  getXPathNormal() {
    return {
      QUESTION_XPATH:
        '/html/body/div[1]/div/div/div[2]/div/div/div[2]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[1]/div/div[2]',
      PARENT_XPATH:
        '/html/body/div[1]/div/div/div[2]/div/div/div[2]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[1]',
      INPUT_XPATH:
        '/html/body/div[1]/div/div/div[2]/div/div/div[2]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[5]/input',
      APPEND_XPATH:
        '/html/body/div[1]/div/div/div[2]/div/div/div[2]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[2]',
      ANSWER_XPATH:
        '/html/body/div[1]/div/div/div[2]/div/div/div[2]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[1]/div[2]',
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
