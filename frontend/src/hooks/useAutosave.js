/**
 * useAutosave Hook
 * 
 * Automatically saves data after a debounced delay.
 * Provides status indicators for UI feedback.
 * 
 * BEGINNER TIP:
 * - Autosave improves UX by saving without explicit button clicks
 * - Shows users clear feedback: "Saving...", "Saved", "Error"
 * - Uses debouncing to avoid excessive API calls
 * - Cancels pending saves on unmount to prevent memory leaks
 * 
 * USAGE:
 * const { status, lastSaved, save, reset } = useAutosave({
 *   data: formData,
 *   onSave: async (data) => await api.save(data),
 *   delay: 1500, // 1.5 seconds
 *   enabled: true,
 * });
 * 
 * STATUS VALUES:
 * - 'idle': No changes, nothing to save
 * - 'pending': Changes detected, waiting for debounce
 * - 'saving': Currently saving to server
 * - 'saved': Successfully saved
 * - 'error': Save failed
 * 
 * SCALABILITY NOTE (10,000+ users):
 * - Debouncing reduces server load significantly
 * - Clear status feedback reduces user anxiety
 * - Error handling prevents data loss
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import useDebounce from './useDebounce';

/**
 * Autosave status types
 */
export const AUTOSAVE_STATUS = {
  IDLE: 'idle',
  PENDING: 'pending',
  SAVING: 'saving',
  SAVED: 'saved',
  ERROR: 'error',
};

/**
 * Autosave hook options
 * @typedef {Object} AutosaveOptions
 * @property {any} data - Data to save (triggers save when changed)
 * @property {Function} onSave - Async function to save data
 * @property {number} delay - Debounce delay in ms (default: 1500)
 * @property {boolean} enabled - Enable/disable autosave (default: true)
 * @property {Function} onSuccess - Callback on successful save
 * @property {Function} onError - Callback on save error
 */

/**
 * useAutosave hook
 * 
 * @param {AutosaveOptions} options - Hook options
 * @returns {Object} - { status, lastSaved, error, save, reset }
 */
const useAutosave = ({
  data,
  onSave,
  delay = 1500,
  enabled = true,
  onSuccess,
  onError,
}) => {
  // State
  const [status, setStatus] = useState(AUTOSAVE_STATUS.IDLE);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState(null);
  
  // Refs for cleanup and tracking
  const isMountedRef = useRef(true);
  const initialDataRef = useRef(data);
  const previousDataRef = useRef(data);
  const saveInProgressRef = useRef(false);

  // Debounced data
  const debouncedData = useDebounce(data, delay);

  /**
   * Check if data has changed from initial
   */
  const hasChanges = useCallback(() => {
    return JSON.stringify(data) !== JSON.stringify(initialDataRef.current);
  }, [data]);

  /**
   * Check if data has changed since last debounce
   */
  const hasNewChanges = useCallback(() => {
    return JSON.stringify(data) !== JSON.stringify(previousDataRef.current);
  }, [data]);

  /**
   * Manual save function
   */
  const save = useCallback(async (dataToSave = data) => {
    if (!onSave || saveInProgressRef.current) return;
    
    saveInProgressRef.current = true;
    setStatus(AUTOSAVE_STATUS.SAVING);
    setError(null);
    
    try {
      await onSave(dataToSave);
      
      if (isMountedRef.current) {
        setStatus(AUTOSAVE_STATUS.SAVED);
        setLastSaved(new Date());
        previousDataRef.current = dataToSave;
        onSuccess?.();
        
        // Reset to idle after showing "Saved" for 2 seconds
        setTimeout(() => {
          if (isMountedRef.current && !hasNewChanges()) {
            setStatus(AUTOSAVE_STATUS.IDLE);
          }
        }, 2000);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setStatus(AUTOSAVE_STATUS.ERROR);
        setError(err.message || 'Failed to save');
        onError?.(err);
      }
    } finally {
      saveInProgressRef.current = false;
    }
  }, [data, onSave, onSuccess, onError, hasNewChanges]);

  /**
   * Reset autosave state
   */
  const reset = useCallback(() => {
    initialDataRef.current = data;
    previousDataRef.current = data;
    setStatus(AUTOSAVE_STATUS.IDLE);
    setError(null);
  }, [data]);

  /**
   * Effect: Update status to pending when data changes
   */
  useEffect(() => {
    if (!enabled) return;
    
    if (hasChanges() && status !== AUTOSAVE_STATUS.SAVING) {
      setStatus(AUTOSAVE_STATUS.PENDING);
    }
  }, [data, enabled, hasChanges, status]);

  /**
   * Effect: Trigger save when debounced data changes
   */
  useEffect(() => {
    if (!enabled || !onSave) return;
    
    // Only save if there are changes and not currently saving
    if (hasChanges() && !saveInProgressRef.current) {
      save(debouncedData);
    }
  }, [debouncedData, enabled, onSave, save, hasChanges]);

  /**
   * Effect: Cleanup on unmount
   */
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    status,
    lastSaved,
    error,
    save,
    reset,
    isPending: status === AUTOSAVE_STATUS.PENDING,
    isSaving: status === AUTOSAVE_STATUS.SAVING,
    isSaved: status === AUTOSAVE_STATUS.SAVED,
    isError: status === AUTOSAVE_STATUS.ERROR,
  };
};

export default useAutosave;
