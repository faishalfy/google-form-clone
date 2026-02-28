/**
 * Button Component
 * 
 * A reusable button component with different variants and states.
 * 
 * Props:
 * - children: Button text/content
 * - variant: 'primary' | 'secondary' | 'danger' | 'outline'
 * - size: 'small' | 'medium' | 'large'
 * - disabled: Boolean to disable the button
 * - loading: Boolean to show loading state
 * - type: 'button' | 'submit' | 'reset'
 * - onClick: Click handler function
 * - fullWidth: Boolean for full width button
 * - className: Additional CSS classes
 */

import './Button.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  fullWidth = false,
  className = '',
  ...rest
}) => {
  // Combine CSS classes based on props
  const buttonClasses = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? 'btn-full-width' : '',
    loading ? 'btn-loading' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {/* Show spinner when loading */}
      {loading && <span className="btn-spinner"></span>}
      
      {/* Button text */}
      <span className={loading ? 'btn-text-loading' : ''}>
        {children}
      </span>
    </button>
  );
};

export default Button;
