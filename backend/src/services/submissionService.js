/**
 * Submission Service
 * 
 * LEVEL 3 FEATURE: Business logic for submission operations
 * 
 * Contains:
 * - Ownership verification (form creator only)
 * - Pagination logic
 * - Data transformation
 * 
 * SECURITY:
 * - Verifies form ownership before returning data
 * - Returns 403 Forbidden for non-owners
 * - Returns 404 for non-existent resources
 * 
 * SCALABILITY (10,000+ users):
 * - Efficient pagination using OFFSET/LIMIT
 * - Single optimized query for submission detail
 * - Proper database indexing leveraged
 */

const submissionModel = require('../models/submissionModel');
const formModel = require('../models/formModel');
const { notFound, forbidden } = require('../utils/apiResponse');

/**
 * List all submissions for a form
 * 
 * @param {string} formId - Form UUID
 * @param {string} userId - Current user ID (for authorization)
 * @param {Object} options - Pagination options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10)
 * @param {string} options.sort - Sort order (asc/desc, default: desc)
 * @returns {Promise<Object>} - { submissions, pagination }
 * 
 * AUTHORIZATION:
 * - Verifies that the requesting user owns the form
 * - Returns 404 if form not found
 * - Returns 403 if user is not the owner
 */
const listSubmissions = async (formId, userId, options = {}) => {
    // Step 1: Verify form exists
    const form = await formModel.findById(formId);
    
    if (!form) {
        throw notFound('Form not found.');
    }
    
    // Step 2: Verify ownership
    if (form.user_id !== userId) {
        throw forbidden('You do not have permission to view submissions for this form.');
    }
    
    // Step 3: Parse and validate pagination options
    const { 
        page = 1, 
        limit = 10, 
        sort = 'desc' 
    } = options;
    
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const sortOrder = ['asc', 'desc'].includes(sort?.toLowerCase()) ? sort.toLowerCase() : 'desc';
    
    // Step 4: Fetch submissions from model
    const result = await submissionModel.findByFormId(formId, {
        page: pageNum,
        limit: limitNum,
        sort: sortOrder
    });
    
    // Step 5: Transform and return data
    return {
        submissions: result.submissions.map(formatSubmission),
        pagination: {
            currentPage: result.page,
            totalPages: result.totalPages,
            totalItems: result.total,
            itemsPerPage: result.limit,
            hasNextPage: result.page < result.totalPages,
            hasPrevPage: result.page > 1
        }
    };
};

/**
 * Get detailed submission with all answers
 * 
 * @param {string} formId - Form UUID
 * @param {string} submissionId - Submission UUID
 * @param {string} userId - Current user ID (for authorization)
 * @returns {Promise<Object>} - Full submission detail with answers
 * 
 * AUTHORIZATION:
 * - Verifies that the requesting user owns the form
 * - Verifies that the submission belongs to the form
 * - Returns 404 if form or submission not found
 * - Returns 403 if user is not the owner
 * 
 * OPTIMIZATION:
 * - Single query with JOINs to fetch all data
 * - Avoids N+1 query problem
 * - Efficient for large datasets
 */
const getSubmissionDetail = async (formId, submissionId, userId) => {
    // Step 1: Verify form exists
    const form = await formModel.findById(formId);
    
    if (!form) {
        throw notFound('Form not found.');
    }
    
    // Step 2: Verify ownership
    if (form.user_id !== userId) {
        throw forbidden('You do not have permission to view this submission.');
    }
    
    // Step 3: Fetch submission detail with optimized query
    const submission = await submissionModel.findByIdWithDetails(submissionId, formId);
    
    if (!submission) {
        throw notFound('Submission not found.');
    }
    
    // Step 4: Verify submission belongs to the form
    if (submission.form_id !== formId) {
        throw notFound('Submission does not belong to this form.');
    }
    
    // Step 5: Format and return
    return formatSubmissionDetail(submission, form);
};

/**
 * Format submission for list response
 * 
 * @param {Object} submission - Raw submission from database
 * @returns {Object} - Formatted submission
 */
const formatSubmission = (submission) => {
    return {
        id: submission.id,
        form_id: submission.form_id,
        submitted_at: submission.submitted_at,
        respondent: submission.user_id ? {
            id: submission.user_id,
            name: submission.respondent_name,
            email: submission.respondent_email
        } : null
    };
};

/**
 * Format submission detail for single response
 * 
 * @param {Object} submission - Raw submission with answers from database
 * @param {Object} form - Form object
 * @returns {Object} - Formatted submission detail
 */
const formatSubmissionDetail = (submission, form) => {
    return {
        id: submission.id,
        form_id: submission.form_id,
        form_title: form.title,
        submitted_at: submission.submitted_at,
        respondent: submission.user_id ? {
            id: submission.user_id,
            name: submission.respondent_name,
            email: submission.respondent_email
        } : null,
        answers: submission.answers.map(answer => ({
            question_id: answer.question_id,
            question_title: answer.question_title,
            question_type: answer.question_type,
            value: parseAnswerValue(answer.value)
        }))
    };
};

/**
 * Parse answer value from database storage format
 * 
 * @param {string|Object} value - Raw value from database
 * @returns {string|Array} - Parsed value
 */
const parseAnswerValue = (value) => {
    // If already parsed (object/array), return as-is
    if (typeof value !== 'string') {
        return value;
    }
    
    // Try to parse JSON string
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
};

module.exports = {
    listSubmissions,
    getSubmissionDetail
};
