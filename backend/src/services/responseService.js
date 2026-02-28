/**
 * Response Service
 * 
 * Contains all business logic for form response operations.
 * Handles:
 * - Submitting responses with answer validation
 * - Validating answers against question types
 * - Ensuring questions belong to the form
 * - Transaction management for data consistency
 */

const responseModel = require('../models/responseModel');
const questionModel = require('../models/questionModel');
const formModel = require('../models/formModel');
const { notFound, forbidden, badRequest } = require('../utils/apiResponse');

/**
 * Submit a response to a form
 * @param {string} formId - Form UUID
 * @param {Object} submissionData - Submission data
 * @param {Array} submissionData.answers - Array of answer objects
 * @param {string} userId - User ID (optional, for authenticated submissions)
 * @returns {Promise<Object>} - Created response with answers
 */
const submitResponse = async (formId, { answers }, userId = null) => {
    // Step 1: Verify form exists and is published
    const form = await formModel.findById(formId);
    
    if (!form) {
        throw notFound('Form not found.');
    }
    
    if (form.status !== 'published') {
        throw forbidden('This form is not accepting responses. The form must be published to accept submissions.');
    }
    
    // Step 2: Get all questions for this form
    const questions = await questionModel.findByFormId(formId);
    
    if (questions.length === 0) {
        throw badRequest('This form has no questions. Cannot submit an empty response.');
    }
    
    // Create a map for quick question lookup
    const questionMap = new Map(questions.map(q => [q.id, q]));
    
    // Step 3: Validate answers
    const validationErrors = [];
    const validatedAnswers = [];
    const answeredQuestionIds = new Set();
    
    for (let i = 0; i < answers.length; i++) {
        const answer = answers[i];
        
        // Check if question_id is provided
        if (!answer.question_id) {
            validationErrors.push({
                index: i,
                field: 'question_id',
                message: 'question_id is required for each answer.'
            });
            continue;
        }
        
        // Check if question exists in this form
        const question = questionMap.get(answer.question_id);
        
        if (!question) {
            validationErrors.push({
                index: i,
                field: 'question_id',
                message: `Question '${answer.question_id}' does not exist in this form.`
            });
            continue;
        }
        
        // Check for duplicate answers
        if (answeredQuestionIds.has(answer.question_id)) {
            validationErrors.push({
                index: i,
                field: 'question_id',
                message: `Duplicate answer for question '${question.title}'. Each question can only be answered once.`
            });
            continue;
        }
        
        answeredQuestionIds.add(answer.question_id);
        
        // Validate answer value based on question type
        const valueValidation = validateAnswerValue(question, answer.value);
        
        if (!valueValidation.valid) {
            validationErrors.push({
                index: i,
                field: 'value',
                question_id: answer.question_id,
                question_title: question.title,
                message: valueValidation.message
            });
            continue;
        }
        
        validatedAnswers.push({
            question_id: answer.question_id,
            value: valueValidation.normalizedValue
        });
    }
    
    // Step 4: Check required questions
    for (const question of questions) {
        if (question.is_required && !answeredQuestionIds.has(question.id)) {
            validationErrors.push({
                field: 'required',
                question_id: question.id,
                question_title: question.title,
                message: `Question '${question.title}' is required but no answer was provided.`
            });
        }
    }
    
    // If there are validation errors, throw them
    if (validationErrors.length > 0) {
        throw badRequest('Validation failed for one or more answers.', validationErrors);
    }
    
    // Step 5: Create response with answers (using transaction)
    const response = await responseModel.createWithAnswers({
        form_id: formId,
        user_id: userId,
        answers: validatedAnswers
    });
    
    return {
        id: response.id,
        form_id: response.form_id,
        submitted_at: response.submitted_at,
        answers_count: response.answers.length,
        message: 'Response submitted successfully.'
    };
};

/**
 * Get response by ID
 * @param {string} responseId - Response UUID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} - Response with answers
 */
const getResponseById = async (responseId, userId) => {
    const response = await responseModel.findById(responseId);
    
    if (!response) {
        throw notFound('Response not found.');
    }
    
    // Check authorization: either the respondent or the form owner can view
    const form = await formModel.findById(response.form_id);
    
    if (response.user_id !== userId && form.user_id !== userId) {
        throw forbidden('You do not have permission to view this response.');
    }
    
    return response;
};

/**
 * Get all responses for a form (form owner only)
 * @param {string} formId - Form UUID
 * @param {string} userId - User ID (for authorization)
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} - Paginated responses
 */
const getResponsesByFormId = async (formId, userId, options = {}) => {
    // Verify form exists and user owns it
    const form = await formModel.findById(formId);
    
    if (!form) {
        throw notFound('Form not found.');
    }
    
    if (form.user_id !== userId) {
        throw forbidden('You do not have permission to view responses for this form.');
    }
    
    const { page = 1, limit = 10, sort = 'desc' } = options;
    
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    
    const result = await responseModel.findByFormId(formId, {
        page: pageNum,
        limit: limitNum,
        sort
    });
    
    return {
        responses: result.responses,
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
 * Get all responses with answers for export (form owner only)
 * @param {string} formId - Form UUID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Array>} - Responses with answers
 */
const getResponsesForExport = async (formId, userId) => {
    // Verify form exists and user owns it
    const form = await formModel.findById(formId);
    
    if (!form) {
        throw notFound('Form not found.');
    }
    
    if (form.user_id !== userId) {
        throw forbidden('You do not have permission to export responses for this form.');
    }
    
    return await responseModel.findByFormIdWithAnswers(formId);
};

/**
 * Get user's own responses
 * @param {string} userId - User UUID
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} - Paginated responses
 */
const getUserResponses = async (userId, options = {}) => {
    const { page = 1, limit = 10 } = options;
    
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    
    const result = await responseModel.findByUserId(userId, {
        page: pageNum,
        limit: limitNum
    });
    
    return {
        responses: result.responses,
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
 * Delete response (form owner only)
 * @param {string} formId - Form UUID
 * @param {string} responseId - Response UUID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<boolean>} - True if deleted
 */
const deleteResponse = async (formId, responseId, userId) => {
    // Verify form exists and user owns it
    const form = await formModel.findById(formId);
    
    if (!form) {
        throw notFound('Form not found.');
    }
    
    if (form.user_id !== userId) {
        throw forbidden('You do not have permission to delete responses for this form.');
    }
    
    // Verify response exists
    const response = await responseModel.findById(responseId);
    
    if (!response) {
        throw notFound('Response not found.');
    }
    
    if (response.form_id !== formId) {
        throw notFound('Response not found in this form.');
    }
    
    await responseModel.remove(responseId);
    
    return true;
};

/**
 * Get answer statistics for a question
 * @param {string} formId - Form UUID
 * @param {string} questionId - Question UUID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} - Answer statistics
 */
const getAnswerStatistics = async (formId, questionId, userId) => {
    // Verify form exists and user owns it
    const form = await formModel.findById(formId);
    
    if (!form) {
        throw notFound('Form not found.');
    }
    
    if (form.user_id !== userId) {
        throw forbidden('You do not have permission to view statistics for this form.');
    }
    
    // Verify question belongs to form
    const belongs = await questionModel.belongsToForm(questionId, formId);
    
    if (!belongs) {
        throw notFound('Question not found in this form.');
    }
    
    return await responseModel.getAnswerStatistics(questionId);
};

/**
 * Helper function to validate answer value based on question type
 * @param {Object} question - Question object
 * @param {any} value - Answer value
 * @returns {Object} - { valid: boolean, message?: string, normalizedValue?: any }
 */
const validateAnswerValue = (question, value) => {
    const { type, options, is_required, title } = question;
    
    // Check if value is provided for required questions
    if (is_required && (value === undefined || value === null || value === '')) {
        return {
            valid: false,
            message: `Answer is required for question '${title}'.`
        };
    }
    
    // Allow empty values for non-required questions
    if (!is_required && (value === undefined || value === null || value === '')) {
        return {
            valid: true,
            normalizedValue: type === 'checkbox' ? [] : ''
        };
    }
    
    switch (type) {
        case 'short_answer':
            // Short answer must be a string
            if (typeof value !== 'string') {
                return {
                    valid: false,
                    message: `Answer for '${title}' must be a text string.`
                };
            }
            if (value.length > 5000) {
                return {
                    valid: false,
                    message: `Answer for '${title}' exceeds maximum length of 5000 characters.`
                };
            }
            return { valid: true, normalizedValue: value.trim() };
            
        case 'multiple_choice':
        case 'dropdown':
            // Must be a single string matching one of the options
            if (typeof value !== 'string') {
                return {
                    valid: false,
                    message: `Answer for '${title}' must be a single text value.`
                };
            }
            if (!options || !options.includes(value)) {
                return {
                    valid: false,
                    message: `Invalid option '${value}' for question '${title}'. Valid options: ${options?.join(', ')}`
                };
            }
            return { valid: true, normalizedValue: value };
            
        case 'checkbox':
            // Must be an array of strings matching options
            if (!Array.isArray(value)) {
                return {
                    valid: false,
                    message: `Answer for '${title}' must be an array of selected options.`
                };
            }
            
            // Validate each selected option
            for (const selected of value) {
                if (typeof selected !== 'string') {
                    return {
                        valid: false,
                        message: `All selected options for '${title}' must be text strings.`
                    };
                }
                if (!options || !options.includes(selected)) {
                    return {
                        valid: false,
                        message: `Invalid option '${selected}' for question '${title}'. Valid options: ${options?.join(', ')}`
                    };
                }
            }
            
            // Check for duplicates
            const uniqueValues = new Set(value);
            if (uniqueValues.size !== value.length) {
                return {
                    valid: false,
                    message: `Duplicate selections found for question '${title}'.`
                };
            }
            
            return { valid: true, normalizedValue: value };
            
        default:
            return {
                valid: false,
                message: `Unknown question type '${type}'.`
            };
    }
};

module.exports = {
    submitResponse,
    getResponseById,
    getResponsesByFormId,
    getResponsesForExport,
    getUserResponses,
    deleteResponse,
    getAnswerStatistics
};
