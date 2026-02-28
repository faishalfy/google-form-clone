/**
 * Submission Service
 * 
 * LEVEL 4 FEATURE: API calls for submissions (Level 3 backend endpoints)
 * 
 * This module handles submission-related API calls:
 * - List submissions for a form (form owner only)
 * - Get submission detail with answers
 * 
 * These endpoints power the Analytics Dashboard.
 * 
 * BEGINNER TIP:
 * - Submissions are responses from users who filled out forms
 * - Only form owners can access submission data
 * - Backend wraps responses in { success, message, data }
 * 
 * SCALABILITY NOTE (10,000+ users):
 * - Pagination is used for large datasets
 * - Aggregation is done client-side for real-time updates
 * - Consider server-side aggregation for very large datasets
 */

import api from './api';

/**
 * Get all submissions for a form (form owner only)
 * 
 * @param {string} formId - The form ID
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 100)
 * @param {string} params.sort - Sort order: 'asc' or 'desc' (default: 'desc')
 * @returns {Promise<Object>} - { submissions: Array, pagination: Object }
 * 
 * EXAMPLE RESPONSE:
 * {
 *   submissions: [
 *     { id: '...', submitted_at: '...', respondent: { name, email } },
 *     ...
 *   ],
 *   pagination: {
 *     currentPage: 1,
 *     totalPages: 5,
 *     totalItems: 100,
 *     itemsPerPage: 20
 *   }
 * }
 */
export const getSubmissions = async (formId, params = {}) => {
  try {
    const response = await api.get(`/forms/${formId}/submissions`, { params });
    return response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch submissions.' };
  }
};

/**
 * Get all submissions with pagination handling
 * Fetches all pages and combines them
 * 
 * @param {string} formId - The form ID
 * @returns {Promise<Array>} - Array of all submissions
 * 
 * NOTE: Use with caution for forms with many submissions
 * Consider server-side aggregation for 10,000+ submissions
 */
export const getAllSubmissions = async (formId) => {
  try {
    let allSubmissions = [];
    let currentPage = 1;
    let totalPages = 1;
    
    do {
      const result = await getSubmissions(formId, { 
        page: currentPage, 
        limit: 100 
      });
      
      const submissions = result.submissions || [];
      allSubmissions = [...allSubmissions, ...submissions];
      
      if (result.pagination) {
        totalPages = result.pagination.totalPages || 1;
      }
      
      currentPage++;
    } while (currentPage <= totalPages);
    
    return allSubmissions;
  } catch (error) {
    throw error;
  }
};

/**
 * Get a single submission with full details
 * 
 * @param {string} formId - The form ID
 * @param {string} submissionId - The submission ID
 * @returns {Promise<Object>} - Submission with answers
 * 
 * EXAMPLE RESPONSE:
 * {
 *   id: '...',
 *   form_id: '...',
 *   form_title: '...',
 *   submitted_at: '...',
 *   respondent: { id, name, email },
 *   answers: [
 *     {
 *       question_id: '...',
 *       question_title: '...',
 *       question_type: 'multiple_choice',
 *       value: 'Selected option'
 *     },
 *     ...
 *   ]
 * }
 */
export const getSubmissionDetail = async (formId, submissionId) => {
  try {
    const response = await api.get(`/forms/${formId}/submissions/${submissionId}`);
    return response.data.data?.submission || response.data.data || response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch submission detail.' };
  }
};

/**
 * Aggregate submission data for analytics
 * 
 * @param {Array} submissions - Array of submission objects with answers
 * @param {Array} questions - Array of question objects
 * @returns {Object} - Aggregated statistics per question
 * 
 * EXAMPLE OUTPUT:
 * {
 *   'question-id-1': {
 *     question: { id, title, type, options },
 *     totalResponses: 50,
 *     data: {
 *       'Option A': 20,
 *       'Option B': 15,
 *       'Option C': 15
 *     }
 *   },
 *   ...
 * }
 * 
 * PERFORMANCE NOTE:
 * - O(n*m) where n = submissions, m = questions
 * - For 10,000+ submissions, consider server-side aggregation
 */
export const aggregateSubmissionData = (submissions, questions) => {
  const stats = {};
  
  // Initialize stats for each question
  questions.forEach((question) => {
    stats[question.id] = {
      question: {
        id: question.id,
        title: question.title,
        type: question.type,
        options: question.options || [],
      },
      totalResponses: 0,
      data: {},
    };
    
    // Pre-populate options for choice questions
    if (question.options?.length > 0) {
      question.options.forEach((option) => {
        stats[question.id].data[option] = 0;
      });
    }
  });
  
  // Process each submission
  submissions.forEach((submission) => {
    const answers = submission.answers || [];
    
    answers.forEach((answer) => {
      const questionStats = stats[answer.question_id];
      if (!questionStats) return;
      
      questionStats.totalResponses++;
      
      const questionType = questionStats.question.type;
      const value = answer.value;
      
      if (questionType === 'short_answer') {
        // For short answers, store individual responses
        if (!questionStats.data.responses) {
          questionStats.data.responses = [];
        }
        questionStats.data.responses.push(value);
        
        // Also compute word frequency
        if (!questionStats.data.wordFrequency) {
          questionStats.data.wordFrequency = {};
        }
        const words = String(value).toLowerCase().split(/\s+/).filter(w => w.length > 2);
        words.forEach((word) => {
          questionStats.data.wordFrequency[word] = 
            (questionStats.data.wordFrequency[word] || 0) + 1;
        });
      } else if (questionType === 'checkbox') {
        // Checkbox can have multiple values (array)
        const values = Array.isArray(value) ? value : [value];
        values.forEach((v) => {
          questionStats.data[v] = (questionStats.data[v] || 0) + 1;
        });
      } else {
        // Multiple choice, dropdown - single value
        questionStats.data[value] = (questionStats.data[value] || 0) + 1;
      }
    });
  });
  
  return stats;
};

/**
 * Format submission date for display
 * 
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
export const formatSubmissionDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
