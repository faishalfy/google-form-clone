/**
 * Question Service
 * 
 * This module handles all question-related API calls:
 * - Get questions for a form
 * - Create a new question
 * - Update a question
 * - Delete a question
 * - Reorder questions
 * 
 * BEGINNER TIP:
 * - Questions are nested under forms in the API
 * - All routes are: /forms/:formId/questions/*
 * - Business constraint: Cannot delete/change type if form has submissions
 * - Backend wraps responses in { success, message, data }
 */

import api from './api';

/**
 * Get all questions for a form
 * 
 * @param {string} formId - The form ID
 * @returns {Promise} - Resolves with array of questions
 */
export const getQuestions = async (formId) => {
  try {
    const response = await api.get(`/forms/${formId}/questions`);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch questions.' };
  }
};

/**
 * Get a single question by ID
 * 
 * @param {string} formId - The form ID
 * @param {string} questionId - The question ID
 * @returns {Promise} - Resolves with question data
 */
export const getQuestionById = async (formId, questionId) => {
  try {
    const response = await api.get(`/forms/${formId}/questions/${questionId}`);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch question.' };
  }
};

/**
 * Create a new question
 * 
 * @param {string} formId - The form ID
 * @param {Object} questionData - The question data
 * @param {string} questionData.title - Question title/text (required)
 * @param {string} questionData.type - Question type (required)
 * @param {Array} questionData.options - Options for multiple choice/checkbox/dropdown
 * @param {boolean} questionData.required - Whether the question is required
 * @param {number} questionData.order - Question order (optional)
 * @returns {Promise} - Resolves with created question
 */
export const createQuestion = async (formId, questionData) => {
  try {
    const response = await api.post(`/forms/${formId}/questions`, questionData);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create question.' };
  }
};

/**
 * Update an existing question
 * 
 * @param {string} formId - The form ID
 * @param {string} questionId - The question ID
 * @param {Object} questionData - The updated question data
 * @returns {Promise} - Resolves with updated question
 * 
 * NOTE: If form has submissions, type cannot be changed
 */
export const updateQuestion = async (formId, questionId, questionData) => {
  try {
    const response = await api.put(`/forms/${formId}/questions/${questionId}`, questionData);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update question.' };
  }
};

/**
 * Delete a question
 * 
 * @param {string} formId - The form ID
 * @param {string} questionId - The question ID
 * @returns {Promise} - Resolves when deletion successful
 * 
 * NOTE: Cannot delete if form has submissions
 */
export const deleteQuestion = async (formId, questionId) => {
  try {
    const response = await api.delete(`/forms/${formId}/questions/${questionId}`);
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete question.' };
  }
};

/**
 * Reorder questions within a form
 * 
 * @param {string} formId - The form ID
 * @param {Array} orderData - Array of { id, order } objects
 * @returns {Promise} - Resolves when reorder successful
 */
export const reorderQuestions = async (formId, orderData) => {
  try {
    const response = await api.put(`/forms/${formId}/questions/reorder`, { questions: orderData });
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to reorder questions.' };
  }
};
