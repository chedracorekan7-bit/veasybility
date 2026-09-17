import './FormField.css';

/**
 * FormField — Champ de formulaire minimaliste niveau Awwwards
 *
 * Props:
 *  - id, name, type, value, onChange, required  → attributs natifs
 *  - label     → texte du label / placeholder flottant
 *  - multiline → si true, rend un <textarea> au lieu d'un <input>
 *  - rows      → nombre de lignes (multiline uniquement, défaut 4)
 */
export default function FormField({
  id,
  name,
  type = 'text',
  value,
  onChange,
  label,
  required = false,
  multiline = false,
  rows = 4,
}) {
  const sharedProps = {
    id,
    name,
    required,
    value,
    onChange,
    placeholder: ' ', // ← astuce CSS :not(:placeholder-shown)
    className: 'ff-input',
    autoComplete: 'off',
  };

  return (
    <div className="ff-wrapper">
      {multiline ? (
        <textarea {...sharedProps} rows={rows} className="ff-input ff-textarea" />
      ) : (
        <input {...sharedProps} type={type} />
      )}
      <label htmlFor={id} className="ff-label">
        {label}
      </label>
      <span className="ff-line" aria-hidden="true" />
    </div>
  );
}
