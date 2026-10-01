import { AlertCircle } from 'lucide-react';

/**
 * FormInstructions — Composant pour afficher les instructions d'accessibilité
 * 
 * Props:
 *  - errorCount: number — Nombre d'erreurs détectées (optionnel)
 *  - showErrors: boolean — Afficher le résumé des erreurs (optionnel)
 */
export default function FormInstructions({ errorCount = 0, showErrors = false }) {
  return (
    <div 
      role="region" 
      aria-label="Instructions du formulaire"
      className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg"
    >
      {/* Instructions générales */}
      <div className="flex items-start gap-3 mb-4">
        <AlertCircle size={18} className="text-blue-600 mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-sm text-blue-900">
          Les champs marqués d'un <span className="font-bold text-red-600">*</span> sont obligatoires.
        </p>
      </div>

      {/* Résumé des erreurs */}
      {showErrors && errorCount > 0 && (
        <div 
          role="alert" 
          aria-live="assertive" 
          aria-atomic="true"
          className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded mt-3"
        >
          <AlertCircle size={18} className="text-red-600 mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-sm text-red-900">
            {errorCount === 1 
              ? '1 erreur détectée dans le formulaire. Veuillez corriger le champ marqué en rouge.'
              : `${errorCount} erreurs détectées dans le formulaire. Veuillez corriger les champs marqués en rouge.`
            }
          </p>
        </div>
      )}

      {/* Conseils d'accessibilité */}
      <div className="mt-4 text-xs text-gray-600 space-y-1">
        <p>💡 <strong>Conseils :</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Utilisez <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Tab</kbd> pour naviguer entre les champs</li>
          <li>Les messages d'erreur s'affichent sous chaque champ invalide</li>
          <li>Appuyez sur <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Entrée</kbd> pour soumettre le formulaire</li>
        </ul>
      </div>
    </div>
  );
}
