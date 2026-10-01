/**
 * useFormspree — Hook réutilisable pour l'envoi de formulaires via Formspree.
 * Version améliorée avec retry logic, meilleure gestion des erreurs et accessibilité.
 *
 * Usage :
 *   const { submit, status, errorMessage, reset } = useFormspree();
 *
 * `status` : 'idle' | 'loading' | 'success' | 'error'
 *
 * Sécurité : les erreurs brutes de l'API Formspree sont interceptées et
 * remplacées par des messages contrôlés — aucun détail interne n'est exposé.
 */

import { useState, useCallback } from 'react';

const FORMSPREE_FORM_ID = import.meta.env.VITE_FORMSPREE_ID;
const FORMSPREE_ENDPOINT = `https://formspree.io/f/${FORMSPREE_FORM_ID}`;
const MAX_RETRIES = 2;
const RETRY_DELAY = 2000; // 2 secondes

/**
 * Mappe les codes d'erreur Formspree vers des messages utilisateur clairs et sûrs.
 * Empêche tout détail technique d'atteindre l'interface.
 * @param {Response} response
 * @param {Object}   result
 * @returns {string}
 */
function resolveErrorMessage(response, result) {
  // Erreur de configuration (endpoint invalide, form inexistant)
  if (response.status === 404) {
    return 'Le formulaire est temporairement indisponible. Réessayez dans quelques instants.';
  }
  // Rate-limit Formspree (plan gratuit : 50 soumissions/mois)
  if (response.status === 422 || response.status === 429) {
    return 'Trop de tentatives ont été effectuées. Veuillez patienter avant de réessayer.';
  }
  // Erreur serveur Formspree
  if (response.status >= 500) {
    return 'Un problème technique empêche l\'envoi. Veuillez réessayer plus tard.';
  }
  // Erreur de validation côté Formspree (ex. email invalide selon leur système)
  const formspreeErrors = result?.errors;
  if (Array.isArray(formspreeErrors) && formspreeErrors.length > 0) {
    // On ne renvoie pas les messages bruts — on traduit selon le champ
    const field = formspreeErrors[0]?.field;
    if (field === 'email') {
      return 'L\'adresse e-mail saisie n\'est pas valide. Vérifiez et réessayez.';
    }
    return 'Certains champs contiennent des informations incorrectes. Vérifiez et réessayez.';
  }
  // Fallback générique — jamais de détail technique
  return 'L\'envoi a échoué. Vérifiez vos informations et réessayez.';
}

/**
 * @param {Object} [options]
 * @param {string} [options.formId]  — Surcharge optionnelle de l'ID de formulaire
 */
export function useFormspree({ formId } = {}) {
  const endpoint = formId
    ? `https://formspree.io/f/${formId}`
    : FORMSPREE_ENDPOINT;

  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * Annonce un message aux lecteurs d'écran
   * @param {string} message
   */
  const announceToScreenReader = useCallback((message) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only'; // Classe pour masquer visuellement
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    // Nettoyer après 3 secondes
    setTimeout(() => announcement.remove(), 3000);
  }, []);

  /**
   * Soumet les données du formulaire à Formspree avec retry logic.
   * @param {Object} data — Les champs à envoyer (clé/valeur)
   * @param {number} [retryCount=0] — Nombre de tentatives actuelles
   * @returns {Promise<boolean>} — true si succès, false sinon
   */
  const submit = useCallback(
    async (data, retryCount = 0) => {
      setStatus('loading');
      setErrorMessage('');

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(data),
        });

        // Lecture du corps même en cas d'erreur HTTP (Formspree renvoie du JSON)
        let result = null;
        try {
          result = await response.json();
        } catch {
          // Corps non JSON — on gère proprement
        }

        if (response.ok) {
          setStatus('success');
          announceToScreenReader('Votre message a été envoyé avec succès.');
          return true;
        }

        // Retry pour les erreurs serveur (5xx)
        if (response.status >= 500 && retryCount < MAX_RETRIES) {
          console.warn(`[Retry ${retryCount + 1}/${MAX_RETRIES}] Erreur serveur ${response.status}`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return submit(data, retryCount + 1);
        }

        const errorMsg = resolveErrorMessage(response, result);
        setErrorMessage(errorMsg);
        setStatus('error');
        announceToScreenReader(`Erreur : ${errorMsg}`);
        return false;

      } catch (error) {
        // Erreur réseau — retry possible
        if (retryCount < MAX_RETRIES) {
          console.warn(`[Retry ${retryCount + 1}/${MAX_RETRIES}] Erreur réseau:`, error.message);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return submit(data, retryCount + 1);
        }

        // Fallback après tous les retries
        const errorMsg = 'Impossible d\'envoyer le message. Vérifiez votre connexion et réessayez.';
        setErrorMessage(errorMsg);
        setStatus('error');
        announceToScreenReader(`Erreur : ${errorMsg}`);
        return false;
      }
    },
    [endpoint, announceToScreenReader]
  );

  /** Remet le formulaire à l'état initial */
  const reset = useCallback(() => {
    setStatus('idle');
    setErrorMessage('');
  }, []);

  return { submit, status, errorMessage, reset };
}
