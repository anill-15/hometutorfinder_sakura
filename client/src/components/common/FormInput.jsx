import { cx } from '../../utils/helpers.js';

/**
 * Accessible form input with label, hint and inline error.
 * The error is wired up with aria-describedby / aria-invalid.
 */
export default function FormInput({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  hint = '',
  error = '',
  required = false,
  disabled = false,
  autoComplete,
  inputMode,
  min,
  max,
  className = '',
  children,
}) {
  const id = `field-${name}`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  return (
    <div className={`field ${className}`}>
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
          {required && <span className="field__required" aria-hidden="true">*</span>}
        </label>
      )}

      <input
        id={id}
        name={name}
        className={cx('input', error && 'input--error')}
        type={type}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        inputMode={inputMode}
        min={min}
        max={max}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={cx(hint && hintId, error && errorId) || undefined}
      />

      {hint && !error && (
        <span className="field__hint" id={hintId}>
          {hint}
        </span>
      )}
      {error && (
        <span className="field__error" id={errorId} role="alert">
          {error}
        </span>
      )}
      {children}
    </div>
  );
}

/** Multi-line variant. */
export function TextAreaInput({
  label,
  name,
  value,
  onChange,
  placeholder = '',
  hint = '',
  error = '',
  required = false,
  disabled = false,
  rows = 4,
  maxLength = 1200,
}) {
  const id = `field-${name}`;

  return (
    <div className="field">
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
          {required && <span className="field__required" aria-hidden="true">*</span>}
        </label>
      )}
      <textarea
        id={id}
        name={name}
        className={cx('textarea', error && 'textarea--error')}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={error ? 'true' : 'false'}
      />
      <div className="row row--between">
        {error ? (
          <span className="field__error" role="alert">
            {error}
          </span>
        ) : (
          <span className="field__hint">{hint}</span>
        )}
        <span className="field__hint mono">
          {(value || '').length}/{maxLength}
        </span>
      </div>
    </div>
  );
}