/**
 * Section Service
 * 
 * LEVEL 4 FEATURE: API calls for multi-section forms
 * 
 * This module handles section-related API calls:
 * - Get sections for a form
 * - Create, update, delete sections
 * - Reorder sections
 * 
 * NOTE: If backend doesn't support sections yet, 
 * this service provides a client-side implementation.
 * 
 * BEGINNER TIP:
 * - Sections group questions into logical parts
 * - Each section can have its own title and description
 * - Questions belong to a section
 * - Respondents see one section at a time
 */

import api from './api';

/**
 * Default section structure
 */
export const createDefaultSection = (order = 0) => ({
  tempId: `section-${Date.now()}`,
  title: order === 0 ? 'Section 1' : `Section ${order + 1}`,
  description: '',
  order: order,
  questions: [],
  isNew: true,
});

/**
 * Get all sections for a form
 * 
 * @param {string} formId - The form ID
 * @returns {Promise<Array>} - Array of sections
 * 
 * NOTE: If backend doesn't support sections, 
 * returns a single default section with all questions
 */
export const getSections = async (formId) => {
  try {
    // Try to get sections from API
    const response = await api.get(`/forms/${formId}/sections`);
    return response.data.data?.sections || response.data.data || [];
  } catch (error) {
    // If endpoint doesn't exist, return null to indicate
    // sections should be created client-side
    if (error.response?.status === 404) {
      return null;
    }
    throw error.response?.data || { message: 'Failed to fetch sections.' };
  }
};

/**
 * Create a new section
 * 
 * @param {string} formId - The form ID
 * @param {Object} sectionData - Section data
 * @returns {Promise<Object>} - Created section
 */
export const createSection = async (formId, sectionData) => {
  try {
    const response = await api.post(`/forms/${formId}/sections`, sectionData);
    return response.data.data?.section || response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create section.' };
  }
};

/**
 * Update a section
 * 
 * @param {string} formId - The form ID
 * @param {string} sectionId - The section ID
 * @param {Object} sectionData - Updated section data
 * @returns {Promise<Object>} - Updated section
 */
export const updateSection = async (formId, sectionId, sectionData) => {
  try {
    const response = await api.put(
      `/forms/${formId}/sections/${sectionId}`, 
      sectionData
    );
    return response.data.data?.section || response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update section.' };
  }
};

/**
 * Delete a section
 * 
 * @param {string} formId - The form ID
 * @param {string} sectionId - The section ID
 * @returns {Promise<void>}
 */
export const deleteSection = async (formId, sectionId) => {
  try {
    await api.delete(`/forms/${formId}/sections/${sectionId}`);
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete section.' };
  }
};

/**
 * Reorder sections
 * 
 * @param {string} formId - The form ID
 * @param {Array} ordering - Array of { id, order } objects
 * @returns {Promise<void>}
 */
export const reorderSections = async (formId, ordering) => {
  try {
    await api.put(`/forms/${formId}/sections/reorder`, { orderings: ordering });
  } catch (error) {
    throw error.response?.data || { message: 'Failed to reorder sections.' };
  }
};

/**
 * Move a question to a different section
 * 
 * @param {string} formId - The form ID
 * @param {string} questionId - The question ID
 * @param {string} targetSectionId - Target section ID
 * @returns {Promise<void>}
 */
export const moveQuestionToSection = async (formId, questionId, targetSectionId) => {
  try {
    await api.put(`/forms/${formId}/questions/${questionId}`, {
      section_id: targetSectionId,
    });
  } catch (error) {
    throw error.response?.data || { message: 'Failed to move question.' };
  }
};

/**
 * Organize questions into sections (client-side)
 * 
 * If backend doesn't support sections, organize questions
 * into a single default section for compatibility.
 * 
 * @param {Array} questions - Array of questions
 * @param {Array} sections - Array of sections (or null)
 * @returns {Array} - Sections with questions
 */
export const organizeQuestionsIntoSections = (questions, sections) => {
  if (!sections || sections.length === 0) {
    // No sections - create a default one with all questions
    return [{
      id: 'default',
      tempId: 'default',
      title: 'Questions',
      description: '',
      order: 0,
      questions: questions || [],
      isDefault: true,
    }];
  }
  
  // Map questions to their sections
  const sectionMap = new Map(
    sections.map(s => [s.id || s.tempId, { ...s, questions: [] }])
  );
  
  questions.forEach((question) => {
    const sectionId = question.section_id || 'default';
    const section = sectionMap.get(sectionId);
    if (section) {
      section.questions.push(question);
    } else {
      // Question doesn't belong to any section - add to first
      const firstSection = sectionMap.values().next().value;
      if (firstSection) {
        firstSection.questions.push(question);
      }
    }
  });
  
  return Array.from(sectionMap.values()).sort((a, b) => a.order - b.order);
};
