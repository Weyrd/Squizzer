export const MESSAGES = {
  REQUEST_IN_PROGRESS: 'Requête en cours...',
  CONNECTION_ERROR: 'Erreur de connexion à GPT.',
  CODE_ERROR: 'Erreur dans le code: ',
  EMPTY_RESPONSE: 'La réponse est vide.',
  RESPONSE_RECEIVED: 'Réponse: ',
  WAITING_FOR_QUESTION: "En attente d'une nouvelle question...",
  GAME_STARTING: 'La partie va bientôt commencer',
  I_DONT_KNOW: 'Je ne connais pas la réponse.',
};

export const PROMPT_ANSWER = `Tu es un champion de Question Pour un champion, imbattable et incollable dans tous les domaines. 
Respecte ces règles strictes :
- Pas de ponctuation, majuscules, ni accents.
- Réponds aux chiffres en chiffres (ex : "6" pas "six"). Ajoute l'unité si nécessaire, sauf si elle est déjà dans la question.
- Réponses en 5 mots max, 1 mot si possible.
- Pour compléter une phrase, donne juste le(s) mot(s) manquant(s) (ex : Fièvre de... Réponds "cheval").
- Pour titres japonais, donne le titre français ou en romaji.
- Si tu ne sais pas, dis ${MESSAGES.I_DONT_KNOW}.`;

export const PROMPT_HINT = `Tu es un expert en indices pour Question Pour un champion. Ton rôle est de donner des indices précis et utiles en respectant ces règles :
- Pas de ponctuation, majuscules, ni accents.
- Indice en 10 mots max.
- Reste concis et clair, ne dévoile pas la réponse.
- Si tu ne connais pas la réponse, dis ${MESSAGES.I_DONT_KNOW}.`;

/*
- Si c'est un chiffre, donne un intervalle ou une approximation (ex : "entre 3 et 5").
- Si c'est un lieu, donne un détail distinctif ou une région.
*/

export const OPENAI_API_KEY =
  '';
