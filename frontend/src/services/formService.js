/**
 * Form Service
 * 
 * This module handles all form-related API calls:
 * - Get all forms
 * - Get a single form by ID
 * - Create a new form
 * - Update an existing form
 * - Delete a form
 * 
 * BEGINNER TIP:
 * - Each function corresponds to a CRUD operation
 * - All functions return promises (async/await)
 * - Error handling is done at the service level
 * - Backend wraps responses in { success, message, data }
 */

import api from './api';

/**
 * Get all forms for the current user
 * 
 * @returns {Promise} - Resolves with an array of forms
 */
export const getAllForms = async () => {
  try {
    const response = await api.get('/forms');
    // Backend wraps response in { success, message, data }
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch forms.' };
  }
};

/**
 * Get a single form by its ID
 * 
 * @param {string} formId - The ID of the form to fetch
 * @returns {Promise} - Resolves with the form data
 */
export const getFormById = async (formId) => {
  try {
    const response = await api.get(`/forms/${formId}`);
    // Backend wraps response in { success, message, data }
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch form details.' };
  }
};

/**
 * Create a new form
 * 
 * @param {Object} formData - The form data to create
 * @param {string} formData.title - Form title
 * @param {string} formData.description - Form description
 * @param {Array} formData.questions - Array of question objects
 * @returns {Promise} - Resolves with the created form
 */
export const createForm = async (formData) => {
  try {
    const response = await api.post('/forms', formData);
    // Backend wraps response in { success, message, data }
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create form.' };
  }
};

/**
 * Update an existing form
 * 
 * @param {string} formId - The ID of the form to update
 * @param {Object} formData - The updated form data
 * @returns {Promise} - Resolves with the updated form
 */
export const updateForm = async (formId, formData) => {
  try {
    const response = await api.put(`/forms/${formId}`, formData);
    // Backend wraps response in { success, message, data }
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update form.' };
  }
};

/**
 * Delete a form
 * 
 * @param {string} formId - The ID of the form to delete
 * @returns {Promise} - Resolves when deletion is successful
 */
export const deleteForm = async (formId) => {
  try {
    const response = await api.delete(`/forms/${formId}`);
    // Backend wraps response in { success, message, data }
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete form.' };
  }
};
