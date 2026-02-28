/**
 * Application Configuration
 * 
 * This file centralizes all configuration values used throughout the app.
 * It reads from environment variables and provides sensible defaults.
 */

const config = {
  // API base URL - comes from environment variable
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  
  // Token key for localStorage
  tokenKey: 'google_form_clone_token',
  
  // User data key for localStorage
  userKey: 'google_form_clone_user',
};

export default config;
