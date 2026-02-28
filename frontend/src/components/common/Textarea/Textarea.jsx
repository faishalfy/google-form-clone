/**
 * Textarea Component
 * 
 * A reusable textarea component for multi-line text input.
 * 
 * Props:
 * - label: Label text
 * - name: Textarea name
 * - value: Controlled value
 * - onChange: Change handler
 * - placeholder: Placeholder text
 * - error: Error message
 * - required: Required field
 * - disabled: Disabled state
 * - rows: Number of visible rows
 * - helperText: Helper text
 */

import './Textarea.css';

const Textarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  rows = 4,
  helperText,
  className = '',
  ...rest
}) => {
  const textareaId = `textarea-${name}`;

  return (
    <div className={`textarea-group ${error ? 'textarea-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="textarea-label">
          {label}
          {required && <span className="textarea-required">*</span>}
        </label>
      )}

      <textarea
        id={textareaId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        className="textarea-field"
        aria-invalid={!!error}
        {...rest}
      />

      {error && (
        <span className="textarea-error-message" role="alert">
          {error}
        </span>
      )}

      {helperText && !error && (
        <span className="textarea-helper-text">{helperText}</span>
      )}
    </div>
  );
};

export default Textarea;
