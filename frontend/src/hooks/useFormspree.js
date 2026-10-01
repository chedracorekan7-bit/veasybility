/**
 * useFormspree — Hook réutilisable pour l'envoi de formulaires via Formspree.
 *
 * Usage :
 *   const { submit, status, errorMessage, reset } = useFormspree();
 *
 * `status` : 'idle' | 'loading' | 'success' | 'error'
 */

import { useState, useCallback } from 'react';

const FORMSPREE_FORM_ID = import.meta.env.VITE_FORMSPREE_ID ;
const FORMSPREE_ENDPOINT = `https://formspree.io/f/${FORMSPREE_FORM_ID}`;

/**
 * @param {Object} [options]
 * @param {string} [options.formId]  — Surcharge optionnelle de l'ID de formulaire
 */
export function useFormspree({ formId } = {}) {
  const endpoint = formId
    ? `https://formspree.io/f/${formId}`
    : FORMSPREE_ENDPOINT;

  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * Soumet les données du formulaire à Formspree.
   * @param {Object} data — Les champs à envoyer (clé/valeur)
   * @returns {Promise<boolean>} — true si succès, false sinon
   */
  const submit = useCallback(
    async (data) => {
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

        const result = await response.json();

        if (response.ok) {
          setStatus('success');
          return true;
        } else {
          // Formspree renvoie { errors: [{ message }] } en cas d'échec
          const msg =
            result?.errors?.map((e) => e.message).join(', ') ||
            'Une erreur est survenue. Veuillez réessayer.';
          setErrorMessage(msg);
          setStatus('error');
          return false;
        }
      } catch {
        setErrorMessage(
          'Impossible de joindre le serveur. Vérifiez votre connexion.'
        );
        setStatus('error');
        return false;
      }
    },
    [endpoint]
  );

  /** Remet le formulaire à l'état initial */
  const reset = useCallback(() => {
    setStatus('idle');
    setErrorMessage('');
  }, []);

  return { submit, status, errorMessage, reset };
}
