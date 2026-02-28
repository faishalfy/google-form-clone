/**
 * RadioGroup Component
 * 
 * A reusable radio button group for single selection.
 * 
 * Props:
 * - label: Group label text
 * - name: Group name attribute (required for radio grouping)
 * - options: Array of options [{ value, label }] or strings
 * - value: Currently selected value (single value)
 * - onChange: Change handler (receives selected value)
 * - error: Error message to display
 * - required: Boolean for required field
 * - disabled: Boolean to disable all radio buttons
 * - className: Additional CSS classes
 * 
 * BEGINNER TIP:
 * - Value is a SINGLE value (not array like CheckboxGroup)
 * - All radios in a group share the same name attribute
 * - Only one option can be selected at a time
 */

import './RadioGroup.css';

const RadioGroup = ({
  label,
  name,
  options = [],
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
}) => {
  // Normalize options to { value, label } format
  const normalizedOptions = options.map((option) => {
    if (typeof option === 'string') {
      return { value: option, label: option };
    }
    return option;
  });

  /**
   * Handle radio selection change
   */
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className={`radio-group ${error ? 'radio-group-error' : ''} ${className}`}>
      {/* Group label */}
      {label && (
        <span className="radio-group-label">
          {label}
          {required && <span className="radio-group-required">*</span>}
        </span>
      )}

      {/* Radio buttons */}
      <div className="radio-group-options" role="radiogroup" aria-label={label}>
        {normalizedOptions.map((option) => (
          <label key={option.value} className="radio-option">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={handleChange}
              disabled={disabled}
              className="radio-input"
            />
            <span className="radio-custom"></span>
            <span className="radio-text">{option.label}</span>
          </label>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <span className="radio-group-error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default RadioGroup;
