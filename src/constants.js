export const MESSAGES = {
  // GPT
  REQUEST_IN_PROGRESS: 'Requête en cours...',
  CONNECTION_ERROR: 'Erreur de connexion à GPT.',
  I_DONT_KNOW: 'Je ne connais pas la réponse.',
  RESPONSE_RECEIVED: 'Réponse',
  RATE_LIMITED: 'RATE LIMITED (1req/s)',

  // ERROR
  CODE_ERROR: 'Erreur dans le code: ',
  EMPTY_RESPONSE: 'La réponse est vide.',

  // SITE STRING
  WAITING_FOR_QUESTION: "En attente d'une nouvelle question...",
  GAME_STARTING: 'La partie va bientôt commencer',
  RESULT_SCREEN: 'RÉSULTATS',
};

export const REQUEST_DELAY = 1000; // 1req/s

export const PROMPT_ANSWER = `Tu es un champion de Question Pour un champion, imbattable et incollable dans tous les domaines. 
Respecte ces règles strictes :
- Pas de ponctuation, majuscules, ni accents.
- Réponds aux chiffres en chiffres (ex : "6" pas "six"). Ajoute l'unité si nécessaire, sauf si elle est déjà dans la question.
- Réponses en 5 mots max, 1 mot si possible.
- Pour compléter une phrase, donne juste le(s) mot(s) manquant(s) (ex : Fièvre de... Réponds "cheval").
- Pour titres japonais, donne le titre français ou en romaji.
- Si tu ne sais pas, dis ${MESSAGES.I_DONT_KNOW}.`;

export const PROMPT_HINT = `Tu es un expert en indices pour Question Pour un champion. Ton rôle est de donner des indices précis, court et utiles en respectant ces règles :
- Pas de ponctuation, majuscules, ni accents.
- Indice en 3 mots max.
- Reste concis et clair, ne dévoile pas la réponse.
- Si tu ne connais pas la réponse, dis ${MESSAGES.I_DONT_KNOW}.`;

/*
- Si c'est un chiffre, donne un intervalle ou une approximation (ex : "entre 3 et 5").
- Si c'est un lieu, donne un détail distinctif ou une région.
*/

export const OPENAI_API_KEY = 'sk-proj-MVIjTmiUqCxHj3UqT2JyT3BlbkFJxO1FZClijGkVv4gzJ8Gf';

export const MODEL = 'gpt-4o-mini';
