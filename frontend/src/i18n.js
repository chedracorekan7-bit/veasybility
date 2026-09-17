import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import fr from './locales/fr.json';
import en from './locales/en.json';

/**
 * Détecte STRICTEMENT et UNIQUEMENT la langue principale du navigateur.
 * Ignore les langues secondaires que le navigateur pourrait avoir en mémoire.
 */
function getStrictPrimaryLanguage() {
  // 1. Récupère uniquement la première langue (langue principale)
  const primaryLang = (navigator.languages && navigator.languages.length > 0)
    ? navigator.languages[0]
    : navigator.language;

  if (!primaryLang) return 'en';

  // 2. Extrait le code (ex: 'fr-FR' devient 'fr', 'de-DE' devient 'de')
  const code = primaryLang.split('-')[0].toLowerCase();

  // 3. Si la langue principale est le français, on retourne le français
  if (code === 'fr') {
    return 'fr';
  }

  // 4. Si c'est l'anglais OU TOUTE AUTRE LANGUE (allemand, espagnol, etc.), c'est l'anglais
  return 'en';
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
    },
    // On force la langue avec notre logique stricte
    lng: getStrictPrimaryLanguage(),
    fallbackLng: 'en',
    interpolation: { 
      escapeValue: false // React protège déjà contre les failles XSS
    },
  });

export default i18n;
