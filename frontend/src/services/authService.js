/**
 * Authentication Service
 * 
 * This module handles all authentication-related API calls:
 * - Register new users
 * - Login existing users
 * - Logout users
 * - Check authentication status
 * 
 * BEGINNER TIP:
 * - Services are functions that interact with external APIs
 * - They return promises that resolve with data or reject with errors
 * - Components call these services instead of making API calls directly
 */

import api from './api';
import config from '../config';

/**
 * Register a new user
 * 
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User's full name
 * @param {string} userData.email - User's email address
 * @param {string} userData.password - User's password
 * @returns {Promise} - Resolves with user data and token
 */
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    
    // Backend wraps response in { success, message, data }
    const responseData = response.data.data || response.data;
    
    // If registration is successful and returns a token, store it
    if (responseData.token) {
      localStorage.setItem(config.tokenKey, responseData.token);
      localStorage.setItem(config.userKey, JSON.stringify(responseData.user));
    }
    
    return responseData;
  } catch (error) {
    // Re-throw the error with a meaningful message
    throw error.response?.data || { message: 'Registration failed. Please try again.' };
  }
};

/**
 * Login an existing user
 * 
 * @param {Object} credentials - User login credentials
 * @param {string} credentials.email - User's email address
 * @param {string} credentials.password - User's password
 * @returns {Promise} - Resolves with user data and token
 */
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    
    // Backend wraps response in { success, message, data }
    const responseData = response.data.data || response.data;
    
    // Store the token and user data in localStorage
    if (responseData.token) {
      localStorage.setItem(config.tokenKey, responseData.token);
      localStorage.setItem(config.userKey, JSON.stringify(responseData.user));
    }
    
    return responseData;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed. Please check your credentials.' };
  }
};

/**
 * Logout the current user
 * 
 * Clears all stored authentication data from localStorage.
 */
export const logout = () => {
  localStorage.removeItem(config.tokenKey);
  localStorage.removeItem(config.userKey);
};

/**
 * Get the current user from localStorage
 * 
 * @returns {Object|null} - The current user object or null if not logged in
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem(config.userKey);
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

/**
 * Check if user is authenticated
 * 
 * @returns {boolean} - True if user has a valid token stored
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem(config.tokenKey);
  return !!token; // Convert to boolean
};

/**
 * Get the current authentication token
 * 
 * @returns {string|null} - The JWT token or null
 */
export const getToken = () => {
  return localStorage.getItem(config.tokenKey);
};
