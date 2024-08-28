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
      INPUT_XPATH:
        "/html/body/div[1]/div/div/div[2]/div/div/div[3]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[5]/input",
      APPEND_XPATH:
        "/html/body/div[1]/div/div/div[2]/div/div/div[3]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[2]",
      GLOBAL_XPATH:
        "/html/body"
    };
  }

  getXPathNormal() {
    return {
      QUESTION_XPATH:
        "/html/body/div[1]/div/div/div[2]/div/div/div[2]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[1]/div/div[2]",
      INPUT_XPATH:
        "/html/body/div[1]/div/div/div[2]/div/div/div[2]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[5]/input",
      APPEND_XPATH:
        "/html/body/div[1]/div/div/div[2]/div/div/div[2]/div[2]/div[2]/div/div/div/div[1]/div[1]/div[2]/div[2]",
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

export function getXPathElement(xpathKey) {
  const xpaths = xpathManager.getXpaths();
  return xpathManager.getElementByXpath(xpaths[xpathKey]);
}


export const observerConditions = {
  // New question div
  isNewGame: (records) =>
    records.some(
      (record) =>
        record.type === 'childList' &&
        record.target.className === 'css-1dbjc4n r-16y2uox' &&
        record.addedNodes.length === 1 &&
        record.addedNodes[0].className.includes('css-1dbjc4n') &&
        record.addedNodes[0].className.includes('r-1dzdj1l') &&
        record.addedNodes[0].className.includes('r-1pcd2l5')
    ),
  // Same question div, different question
  isNewQuestion: (records) =>
    records.some(
      (record) =>
        record.type === 'characterData' &&
        record.target.parentNode.className.includes('css-901oao') &&
        record.target.parentNode.className.includes('r-jwli3a') &&
        record.target.parentNode.className.includes('r-1mkrsdo') &&
        record.target.parentNode.className.includes('r-1x35g6')
    ),
  // New answer div
  isNewAnswer: (records) =>
    records.some(
      (record) =>
        record.type === 'childList' &&
        record.target.className === 'css-1dbjc4n r-16y2uox' &&
        record.addedNodes.length === 1 &&
        record.addedNodes[0].className === 'css-1dbjc4n'
    ),
};