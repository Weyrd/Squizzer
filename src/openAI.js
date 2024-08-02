import { MESSAGES, OPENAI_API_KEY, PROMPT_ANSWER, PROMPT_HINT, REQUEST_DELAY } from './constants.js';

import Logger from './logger';

let lastRequestTime = 0;

export async function requestGPT(question, hint) {
  if (OPENAI_API_KEY === '') {
    return MESSAGES.CODE_ERROR + 'No OpenAI API key provided.';
  }

  const currentTime = Date.now();
  // Check if the time since the last request is less than the REQUEST_DELAY
  if (currentTime - lastRequestTime < REQUEST_DELAY) {
    const waitTime = REQUEST_DELAY - (currentTime - lastRequestTime);
    Logger.log(`⏳ ~ Rate limit in effect. Dropping request. Please wait ${waitTime}ms.`);
    return MESSAGES.RATE_LIMITED;
  }

  try {
    Logger.log(`🤖 ~ Sending the question to ChatGPT: "${question}"\nHint mode: ${hint}`);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: hint ? PROMPT_HINT : PROMPT_ANSWER,
          },
          {
            role: 'user',
            content: question,
          },
        ],
        temperature: 0,
        max_tokens: 30,
      }),
    });

    const data = await response.json();
    // this regex remove tab, new line etc from the answer but do not remove space
    const answer = data.choices[0].message.content.trim().replace(/[^\S ]+/g, '');
    try {
      if (answer.length > 0) {
        return answer;
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
