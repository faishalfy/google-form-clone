/**
 * API Service Layer
 * 
 * This module handles all HTTP requests to the backend API.
 * It provides a centralized way to make API calls with proper
 * authentication headers and error handling.
 * 
 * BEGINNER TIP:
 * - We use axios for HTTP requests (similar to fetch but with more features)
 * - Interceptors allow us to modify requests/responses globally
 * - This pattern keeps API logic separate from components
 */

import axios from 'axios';
import config from '../config';

// Create an axios instance with default configuration
// This instance will be used for all API calls
const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * 
 * This runs BEFORE every request is sent.
 * We use it to automatically attach the JWT token to all requests.
 */
api.interceptors.request.use(
  (requestConfig) => {
    // Get the token from localStorage
    const token = localStorage.getItem(config.tokenKey);
    
    // If token exists, add it to the Authorization header
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    
    return requestConfig;
  },
  (error) => {
    // If there's an error before the request is sent
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * 
 * This runs AFTER every response is received.
 * We use it to handle common errors like authentication failures.
 */
api.interceptors.response.use(
  (response) => {
    // If the response is successful, just return the data
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response) {
      // The server responded with an error status code
      
      if (error.response.status === 401) {
        // Token is invalid or expired
        // Clear stored credentials and redirect to login
        localStorage.removeItem(config.tokenKey);
        localStorage.removeItem(config.userKey);
        
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
