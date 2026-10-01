/**
 * errorCodes.js — Configuration centralisée des codes d'erreur
 * 
 * Permet de tracer les erreurs sans exposer les détails techniques
 * et de maintenir une cohérence entre frontend et backend.
 */

export const ERROR_CODES = {
  // Erreurs de validation
  FORM_VALIDATION: 'ERR_FORM_001',
  INVALID_EMAIL: 'ERR_FORM_002',
  INVALID_PHONE: 'ERR_FORM_003',
  REQUIRED_FIELD: 'ERR_FORM_004',
  
  // Erreurs réseau
  NETWORK_ERROR: 'ERR_NET_001',
  TIMEOUT: 'ERR_NET_002',
  CONNECTION_REFUSED: 'ERR_NET_003',
  
  // Erreurs serveur
  SERVER_ERROR: 'ERR_SRV_001',
  DATABASE_ERROR: 'ERR_SRV_002',
  MAIL_ERROR: 'ERR_SRV_003',
  
  // Erreurs de rate limiting
  RATE_LIMIT: 'ERR_RATE_001',
  TOO_MANY_REQUESTS: 'ERR_RATE_002',
  
  // Erreurs de configuration
  CONFIG_ERROR: 'ERR_CFG_001',
  MISSING_ENDPOINT: 'ERR_CFG_002',
};

/**
 * Messages d'erreur génériques et sûrs
 * Aucun détail technique n'est exposé à l'utilisateur
 */
export const ERROR_MESSAGES = {
  [ERROR_CODES.FORM_VALIDATION]: 'Veuillez vérifier les informations saisies.',
  [ERROR_CODES.INVALID_EMAIL]: 'Email invalide. Format attendu : prenom@domaine.com',
  [ERROR_CODES.INVALID_PHONE]: 'Téléphone invalide. Exemples : +33 6 12 34 56 78 ou 06 12 34 56 78',
  [ERROR_CODES.REQUIRED_FIELD]: 'Ce champ est obligatoire.',
  
  [ERROR_CODES.NETWORK_ERROR]: 'Impossible d\'envoyer le message. Vérifiez votre connexion et réessayez.',
  [ERROR_CODES.TIMEOUT]: 'La requête a pris trop de temps. Veuillez réessayer.',
  [ERROR_CODES.CONNECTION_REFUSED]: 'Impossible de se connecter au serveur. Vérifiez votre connexion.',
  
  [ERROR_CODES.SERVER_ERROR]: 'Un problème technique empêche l\'envoi. Veuillez réessayer plus tard.',
  [ERROR_CODES.DATABASE_ERROR]: 'Une erreur technique empêche l\'enregistrement. Veuillez réessayer dans quelques instants.',
  [ERROR_CODES.MAIL_ERROR]: 'Votre message a été reçu mais l\'email de confirmation n\'a pas pu être envoyé.',
  
  [ERROR_CODES.RATE_LIMIT]: 'Trop de tentatives ont été effectuées. Veuillez patienter avant de réessayer.',
  [ERROR_CODES.TOO_MANY_REQUESTS]: 'Trop de requêtes. Veuillez attendre quelques secondes avant de réessayer.',
  
  [ERROR_CODES.CONFIG_ERROR]: 'Le formulaire est temporairement indisponible. Réessayez dans quelques instants.',
  [ERROR_CODES.MISSING_ENDPOINT]: 'Le formulaire est mal configuré. Veuillez contacter le support.',
};

/**
 * Mappe les codes HTTP vers les codes d'erreur internes
 */
export const HTTP_TO_ERROR_CODE = {
  400: ERROR_CODES.FORM_VALIDATION,
  404: ERROR_CODES.CONFIG_ERROR,
  408: ERROR_CODES.TIMEOUT,
  422: ERROR_CODES.FORM_VALIDATION,
  429: ERROR_CODES.RATE_LIMIT,
  500: ERROR_CODES.SERVER_ERROR,
  502: ERROR_CODES.SERVER_ERROR,
  503: ERROR_CODES.SERVER_ERROR,
  504: ERROR_CODES.TIMEOUT,
};

/**
 * Récupère le message d'erreur sûr pour un code d'erreur
 * @param {string} errorCode
 * @returns {string}
 */
export function getSafeErrorMessage(errorCode) {
  return ERROR_MESSAGES[errorCode] || 'Une erreur est survenue. Veuillez réessayer.';
}

/**
 * Récupère le code d'erreur pour un statut HTTP
 * @param {number} statusCode
 * @returns {string}
 */
export function getErrorCodeFromStatus(statusCode) {
  return HTTP_TO_ERROR_CODE[statusCode] || ERROR_CODES.SERVER_ERROR;
}

/**
 * Enregistre une erreur avec son code (côté client)
 * @param {string} errorCode
 * @param {any} details
 */
export function logError(errorCode, details = {}) {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${errorCode}]`, details);
  }
  
  // En production, envoyer à un service de monitoring (Sentry, Rollbar, etc.)
  // Example: Sentry.captureException(new Error(errorCode), { extra: details });
}
