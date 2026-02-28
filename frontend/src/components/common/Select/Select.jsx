/**
 * Select Component
 * 
 * A reusable select/dropdown component with label, error handling, and validation states.
 * 
 * Props:
 * - label: Label text for the select
 * - name: Select name attribute
 * - value: Select value (controlled)
 * - onChange: Change handler function
 * - options: Array of options [{ value, label }] or array of strings
 * - placeholder: Placeholder text (first disabled option)
 * - error: Error message to display
 * - required: Boolean for required field
 * - disabled: Boolean to disable select
 * - helperText: Helper text below select
 * - className: Additional CSS classes
 * 
 * BEGINNER TIP:
 * - Options can be an array of objects { value, label } or simple strings
 * - Placeholder creates a disabled first option
 * - Controlled component: value is managed by parent
 */

import './Select.css';

const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error,
  required = false,
  disabled = false,
  helperText,
  className = '',
  ...rest
}) => {
  // Generate unique ID for accessibility
  const selectId = `select-${name}`;

  // Normalize options to { value, label } format
  const normalizedOptions = options.map((option) => {
    if (typeof option === 'string') {
      return { value: option, label: option };
    }
    return option;
  });

  return (
    <div className={`select-group ${error ? 'select-error' : ''} ${className}`}>
      {/* Label */}
      {label && (
        <label htmlFor={selectId} className="select-label">
          {label}
          {required && <span className="select-required">*</span>}
        </label>
      )}

      {/* Select field */}
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className="select-field"
        aria-invalid={!!error}
        aria-describedby={error ? `${selectId}-error` : undefined}
        {...rest}
      >
        {/* Placeholder option */}
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}

        {/* Options */}
        {normalizedOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Error message */}
      {error && (
        <span id={`${selectId}-error`} className="select-error-message" role="alert">
          {error}
        </span>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <span className="select-helper-text">{helperText}</span>
      )}
    </div>
  );
};

export default Select;
