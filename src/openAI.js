import {
  MESSAGES,
  OPENAI_API_KEY,
  PROMPT_ANSWER,
  PROMPT_HINT,
} from './constants.js';

import Logger from './logger';

export async function requestGPT(current_question, hint) {
  Logger.log(`🤖 ~ Sending the question to ChatGPT: "${current_question}"\nHint mode: ${hint}`);

  if (OPENAI_API_KEY === '') {
    return MESSAGES.CODE_ERROR + 'No OpenAI API key provided.';
  }

  try {
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
            content: current_question,
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
      .replace(/[^\S ]+/g, '');
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
