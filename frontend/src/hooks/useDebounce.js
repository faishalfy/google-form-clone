/**
 * useDebounce Hook
 * 
 * Debounces a value, only updating it after the specified delay
 * has passed without any new changes.
 * 
 * BEGINNER TIP:
 * - Debouncing prevents excessive function calls
 * - Useful for search inputs, autosave, etc.
 * - The value only updates after the user stops typing/changing
 * 
 * EXAMPLE:
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 500);
 * 
 * // debouncedSearch only updates 500ms after searchTerm stops changing
 * useEffect(() => {
 *   searchAPI(debouncedSearch);
 * }, [debouncedSearch]);
 * 
 * SCALABILITY NOTE (10,000+ users):
 * - Reduces API calls significantly
 * - Improves server performance
 * - Better user experience with less network requests
 */

import { useState, useEffect } from 'react';

/**
 * Debounce a value
 * 
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 500ms)
 * @returns {any} - The debounced value
 */
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up a timer to update the debounced value
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if value changes before delay
    // This is the key to debouncing!
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
