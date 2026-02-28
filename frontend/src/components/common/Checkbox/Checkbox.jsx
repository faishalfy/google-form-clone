/**
 * Checkbox Component
 * 
 * A reusable checkbox component for single or grouped checkboxes.
 * 
 * Props:
 * - label: Label text for the checkbox
 * - name: Checkbox name attribute
 * - checked: Boolean controlled state
 * - onChange: Change handler function
 * - error: Error message to display
 * - disabled: Boolean to disable checkbox
 * - className: Additional CSS classes
 * 
 * BEGINNER TIP:
 * - For single checkbox: use checked/onChange
 * - For checkbox group: use CheckboxGroup component
 * - Controlled component: checked is managed by parent
 */

import './Checkbox.css';

const Checkbox = ({
  label,
  name,
  checked = false,
  onChange,
  error,
  disabled = false,
  className = '',
  value,
  ...rest
}) => {
  const checkboxId = `checkbox-${name}-${value || 'single'}`;

  return (
    <div className={`checkbox-wrapper ${error ? 'checkbox-error' : ''} ${className}`}>
      <label htmlFor={checkboxId} className="checkbox-label">
        <input
          type="checkbox"
          id={checkboxId}
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          value={value}
          className="checkbox-input"
          aria-invalid={!!error}
          {...rest}
        />
        <span className="checkbox-custom"></span>
        <span className="checkbox-text">{label}</span>
      </label>
      
      {error && (
        <span className="checkbox-error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default Checkbox;
