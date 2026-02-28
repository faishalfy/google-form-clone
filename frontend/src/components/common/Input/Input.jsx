/**
 * Input Component
 * 
 * A reusable input component with label, error handling, and validation states.
 * 
 * Props:
 * - label: Label text for the input
 * - type: Input type (text, email, password, etc.)
 * - name: Input name attribute
 * - value: Input value (controlled)
 * - onChange: Change handler function
 * - placeholder: Placeholder text
 * - error: Error message to display
 * - required: Boolean for required field
 * - disabled: Boolean to disable input
 * - helperText: Helper text below input
 * - className: Additional CSS classes
 */

import './Input.css';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  helperText,
  className = '',
  ...rest
}) => {
  // Generate unique ID for accessibility
  const inputId = `input-${name}`;

  return (
    <div className={`input-group ${error ? 'input-error' : ''} ${className}`}>
      {/* Label */}
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}

      {/* Input field */}
      <input
        id={inputId}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="input-field"
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...rest}
      />

      {/* Error message */}
      {error && (
        <span id={`${inputId}-error`} className="input-error-message" role="alert">
          {error}
        </span>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <span className="input-helper-text">{helperText}</span>
      )}
    </div>
  );
};

export default Input;
