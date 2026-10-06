/** Native select styled to match the inputs. `options` is [{value, label}]. */
export default function SelectInput({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select',
  hint = '',
  error = '',
  required = false,
  disabled = false,
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
      <select
        id={id}
        name={name}
        className={`select ${error ? 'select--error' : ''}`}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        disabled={disabled}
        aria-invalid={error ? 'true' : 'false'}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && !error && <span className="field__hint">{hint}</span>}
      {error && (
        <span className="field__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}