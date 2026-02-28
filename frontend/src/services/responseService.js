/**
 * Response Service
 * 
 * This module handles all form response/submission API calls:
 * - Submit a response to a form
 * - Get responses for a form (owner only)
 * - Get a single response
 * - Export responses
 * 
 * BEGINNER TIP:
 * - Responses are submissions from users filling out forms
 * - Answers are nested within responses
 * - Submit endpoint is public (optionally authenticated)
 * - Backend wraps responses in { success, message, data }
 */

import api from './api';

/**
 * Submit a response to a form
 * 
 * @param {string} formId - The form ID
 * @param {Object} responseData - The response data
 * @param {Array} responseData.answers - Array of answer objects
 * @param {string} responseData.answers[].questionId - The question ID
 * @param {string|Array} responseData.answers[].value - The answer value
 * @returns {Promise} - Resolves with submission confirmation
 * 
 * EXAMPLE:
 * submitResponse('form123', {
 *   answers: [
 *     { questionId: 'q1', value: 'My answer' },
 *     { questionId: 'q2', value: ['option1', 'option2'] }
 *   ]
 * });
 */
export const submitResponse = async (formId, responseData) => {
  try {
    const response = await api.post(`/forms/${formId}/submit`, responseData);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to submit response.' };
  }
};

/**
 * Get all responses for a form (form owner only)
 * 
 * @param {string} formId - The form ID
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise} - Resolves with array of responses
 */
export const getResponses = async (formId, params = {}) => {
  try {
    const response = await api.get(`/forms/${formId}/responses`, { params });
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch responses.' };
  }
};

/**
 * Get a single response by ID
 * 
 * @param {string} formId - The form ID
 * @param {string} responseId - The response ID
 * @returns {Promise} - Resolves with response data
 */
export const getResponseById = async (formId, responseId) => {
  try {
    const response = await api.get(`/forms/${formId}/responses/${responseId}`);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch response.' };
  }
};

/**
 * Delete a response (form owner only)
 * 
 * @param {string} formId - The form ID
 * @param {string} responseId - The response ID
 * @returns {Promise} - Resolves when deletion successful
 */
export const deleteResponse = async (formId, responseId) => {
  try {
    const response = await api.delete(`/forms/${formId}/responses/${responseId}`);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete response.' };
  }
};

/**
 * Export all responses for a form
 * 
 * @param {string} formId - The form ID
 * @returns {Promise} - Resolves with export data
 */
export const exportResponses = async (formId) => {
  try {
    const response = await api.get(`/forms/${formId}/responses/export`);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to export responses.' };
  }
};

/**
 * Get answer statistics for a question
 * 
 * @param {string} formId - The form ID
 * @param {string} questionId - The question ID
 * @returns {Promise} - Resolves with statistics data
 */
export const getAnswerStatistics = async (formId, questionId) => {
  try {
    const response = await api.get(`/forms/${formId}/questions/${questionId}/statistics`);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch statistics.' };
  }
};
