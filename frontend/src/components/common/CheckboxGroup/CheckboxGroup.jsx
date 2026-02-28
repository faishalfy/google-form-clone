/**
 * CheckboxGroup Component
 * 
 * A reusable checkbox group for multiple selection.
 * 
 * Props:
 * - label: Group label text
 * - name: Group name attribute
 * - options: Array of options [{ value, label }] or strings
 * - value: Array of selected values
 * - onChange: Change handler (receives array of values)
 * - error: Error message to display
 * - required: Boolean for required field
 * - disabled: Boolean to disable all checkboxes
 * - className: Additional CSS classes
 * 
 * BEGINNER TIP:
 * - Value is an ARRAY of selected option values
 * - onChange receives the updated array of values
 * - Use for questions allowing multiple selections
 */

import Checkbox from '../Checkbox';
import './CheckboxGroup.css';

const CheckboxGroup = ({
  label,
  name,
  options = [],
  value = [],
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
   * Handle checkbox change
   * Add or remove value from the array
   */
  const handleChange = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    
    onChange(newValue);
  };

  return (
    <div className={`checkbox-group ${error ? 'checkbox-group-error' : ''} ${className}`}>
      {/* Group label */}
      {label && (
        <span className="checkbox-group-label">
          {label}
          {required && <span className="checkbox-group-required">*</span>}
        </span>
      )}

      {/* Checkboxes */}
      <div className="checkbox-group-options">
        {normalizedOptions.map((option) => (
          <Checkbox
            key={option.value}
            name={name}
            value={option.value}
            label={option.label}
            checked={value.includes(option.value)}
            onChange={() => handleChange(option.value)}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Error message */}
      {error && (
        <span className="checkbox-group-error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default CheckboxGroup;
