/**
 * Alert Component
 * 
 * Displays alert messages for success, error, warning, or info.
 * 
 * Props:
 * - type: 'success' | 'error' | 'warning' | 'info'
 * - message: Alert message text
 * - onClose: Optional close handler
 */

import './Alert.css';

const Alert = ({
  type = 'info',
  message,
  onClose,
}) => {
  if (!message) return null;

  return (
    <div className={`alert alert-${type}`} role="alert">
      <span className="alert-message">{message}</span>
      {onClose && (
        <button
          type="button"
          className="alert-close"
          onClick={onClose}
          aria-label="Close alert"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
