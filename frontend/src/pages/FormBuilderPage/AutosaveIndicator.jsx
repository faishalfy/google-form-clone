/**
 * AutosaveIndicator Component
 * 
 * LEVEL 4 FEATURE: Visual indicator for autosave status
 * 
 * Shows the current autosave status:
 * - Idle: No indicator
 * - Pending: "Unsaved changes..."
 * - Saving: "Saving..." with spinner
 * - Saved: "Saved ✓" with timestamp
 * - Error: "Save failed" with retry option
 * 
 * BEGINNER TIP:
 * - This component provides visual feedback for autosave
 * - Reduces user anxiety about losing changes
 * - Shows when the last save occurred
 */

import { AUTOSAVE_STATUS } from '../../hooks';
import './AutosaveIndicator.css';

/**
 * Format timestamp for display
 */
const formatTime = (date) => {
  if (!date) return '';
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * AutosaveIndicator Component
 */
const AutosaveIndicator = ({ status, lastSaved, error, onRetry }) => {
  // Don't show anything in idle state
  if (status === AUTOSAVE_STATUS.IDLE && !lastSaved) {
    return null;
  }

  return (
    <div className={`autosave-indicator status-${status}`}>
      {status === AUTOSAVE_STATUS.PENDING && (
        <>
          <span className="indicator-dot pending"></span>
          <span className="indicator-text">Unsaved changes</span>
        </>
      )}

      {status === AUTOSAVE_STATUS.SAVING && (
        <>
          <span className="indicator-spinner"></span>
          <span className="indicator-text">Saving...</span>
        </>
      )}

      {status === AUTOSAVE_STATUS.SAVED && (
        <>
          <span className="indicator-checkmark">✓</span>
          <span className="indicator-text">
            Saved {lastSaved && `at ${formatTime(lastSaved)}`}
          </span>
        </>
      )}

      {status === AUTOSAVE_STATUS.ERROR && (
        <>
          <span className="indicator-error">!</span>
          <span className="indicator-text">
            Save failed
            {onRetry && (
              <button className="retry-button" onClick={onRetry}>
                Retry
              </button>
            )}
          </span>
        </>
      )}

      {status === AUTOSAVE_STATUS.IDLE && lastSaved && (
        <>
          <span className="indicator-checkmark faded">✓</span>
          <span className="indicator-text faded">
            Last saved at {formatTime(lastSaved)}
          </span>
        </>
      )}
    </div>
  );
};

export default AutosaveIndicator;
