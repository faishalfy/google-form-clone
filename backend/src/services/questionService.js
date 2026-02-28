/**
 * Question Service
 * 
 * Contains all business logic for question operations.
 * Implements business constraints:
 * - Cannot delete questions if form has submissions
 * - Cannot change question type if form has submissions
 * - Validates options for choice-based question types
 */

const questionModel = require('../models/questionModel');
const formModel = require('../models/formModel');
const { notFound, forbidden, badRequest, conflict } = require('../utils/apiResponse');

/**
 * Create a new question
 * @param {string} formId - Form UUID
 * @param {Object} questionData - Question data
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} - Created question
 */
const createQuestion = async (formId, questionData, userId) => {
    // Verify form exists and user owns it
    const form = await formModel.findById(formId);
    
    if (!form) {
        throw notFound('Form not found.');
    }
    
    if (form.user_id !== userId) {
        throw forbidden('You do not have permission to add questions to this form.');
    }
    
    // Validate question type
    if (!questionModel.VALID_TYPES.includes(questionData.type)) {
        throw badRequest(`Invalid question type. Must be one of: ${questionModel.VALID_TYPES.join(', ')}`);
    }
    
    // Validate options for choice-based questions
    validateOptionsForType(questionData.type, questionData.options);
    
    // Get next order index if not provided
    const orderIndex = questionData.order_index ?? await questionModel.getNextOrderIndex(formId);
    
    const question = await questionModel.create({
        form_id: formId,
        title: questionData.title,
        type: questionData.type,
        options: questionData.options || null,
        is_required: questionData.is_required || false,
        order_index: orderIndex
    });
    
    return question;
};

/**
 * Get question by ID
 * @param {string} formId - Form UUID
 * @param {string} questionId - Question UUID
 * @param {string} userId - User ID (optional, for access control)
 * @returns {Promise<Object>} - Question object
 */
const getQuestionById = async (formId, questionId, userId = null) => {
    // Verify form exists
    const form = await formModel.findById(formId);
    
    if (!form) {
        throw notFound('Form not found.');
    }
    
    // Check access: if form is not published, only owner can view
    if (form.status !== 'published' && userId !== form.user_id) {
        throw forbidden('You do not have permission to view this question.');
    }
    
    // Get question
    const question = await questionModel.findById(questionId);
    
    if (!question) {
        throw notFound('Question not found.');
    }
    
    // Verify question belongs to form
    if (question.form_id !== formId) {
        throw notFound('Question not found in this form.');
    }
    
    return question;
};

/**
 * Get all questions for a form
 * @param {string} formId - Form UUID
 * @param {string} userId - User ID (optional, for access control)
 * @returns {Promise<Array>} - Array of questions
 */
const getQuestionsByFormId = async (formId, userId = null) => {
    // Verify form exists
    const form = await formModel.findById(formId);
    
    if (!form) {
        throw notFound('Form not found.');
    }
    
    // Check access: if form is not published, only owner can view
    if (form.status !== 'published' && userId !== form.user_id) {
        throw forbidden('You do not have permission to view questions for this form.');
    }
    
    const questions = await questionModel.findByFormId(formId);
    
    return questions;
};

/**
 * Update question
 * Implements business constraint: Cannot change type if form has submissions
 * @param {string} formId - Form UUID
 * @param {string} questionId - Question UUID
 * @param {Object} updates - Fields to update
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} - Updated question
 */
const updateQuestion = async (formId, questionId, updates, userId) => {
    // Verify form exists and user owns it
    const form = await formModel.findById(formId);
    
    if (!form) {
        throw notFound('Form not found.');
    }
    
    if (form.user_id !== userId) {
        throw forbidden('You do not have permission to update questions in this form.');
    }
    
    // Get existing question
    const existingQuestion = await questionModel.findById(questionId);
    
    if (!existingQuestion) {
        throw notFound('Question not found.');
    }
    
    if (existingQuestion.form_id !== formId) {
        throw notFound('Question not found in this form.');
    }
    
    // BUSINESS CONSTRAINT: Check if form has submissions
    const hasSubmissions = await formModel.hasSubmissions(formId);
    
    if (hasSubmissions) {
        // Cannot change question type if form has submissions
        if (updates.type !== undefined && updates.type !== existingQuestion.type) {
            throw conflict(
                'Cannot change question type because this form already has submissions. ' +
                'Changing the type would invalidate existing answers.'
            );
        }
        
        // Also restrict changing options for choice-based questions with submissions
        if (updates.options !== undefined && 
            questionModel.TYPES_REQUIRING_OPTIONS.includes(existingQuestion.type)) {
            // Allow adding new options, but warn if removing existing ones
            const existingOptions = existingQuestion.options || [];
            const newOptions = updates.options || [];
            
            // Check if any existing option is being removed
            const removedOptions = existingOptions.filter(opt => !newOptions.includes(opt));
            
            if (removedOptions.length > 0) {
                throw conflict(
                    'Cannot remove existing options because this form already has submissions. ' +
                    'You can only add new options. Removed options: ' + removedOptions.join(', ')
                );
            }
        }
    }
    
    // Validate question type if being changed
    if (updates.type && !questionModel.VALID_TYPES.includes(updates.type)) {
        throw badRequest(`Invalid question type. Must be one of: ${questionModel.VALID_TYPES.join(', ')}`);
    }
    
    // Determine final type for options validation
    const finalType = updates.type || existingQuestion.type;
    const finalOptions = updates.options !== undefined ? updates.options : existingQuestion.options;
    
    // Validate options for the final type
    validateOptionsForType(finalType, finalOptions);
    
    // Build updates object
    const allowedUpdates = {};
    if (updates.title !== undefined) allowedUpdates.title = updates.title;
    if (updates.type !== undefined) allowedUpdates.type = updates.type;
    if (updates.options !== undefined) allowedUpdates.options = updates.options;
    if (updates.is_required !== undefined) allowedUpdates.is_required = updates.is_required;
    if (updates.order_index !== undefined) allowedUpdates.order_index = updates.order_index;
    
    const updatedQuestion = await questionModel.update(questionId, allowedUpdates);
    
    return updatedQuestion;
};

/**
 * Delete question
 * Implements business constraint: Cannot delete if form has submissions
 * @param {string} formId - Form UUID
 * @param {string} questionId - Question UUID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<boolean>} - True if deleted
 */
const deleteQuestion = async (formId, questionId, userId) => {
    // Verify form exists and user owns it
    const form = await formModel.findById(formId);
    
    if (!form) {
        throw notFound('Form not found.');
    }
    
    if (form.user_id !== userId) {
        throw forbidden('You do not have permission to delete questions from this form.');
    }
    
    // Get existing question
    const existingQuestion = await questionModel.findById(questionId);
    
    if (!existingQuestion) {
        throw notFound('Question not found.');
    }
    
    if (existingQuestion.form_id !== formId) {
        throw notFound('Question not found in this form.');
    }
    
    // BUSINESS CONSTRAINT: Cannot delete if form has submissions
    const hasSubmissions = await formModel.hasSubmissions(formId);
    
    if (hasSubmissions) {
        throw conflict(
            'Cannot delete question because this form already has submissions. ' +
            'Deleting questions would result in incomplete response data. ' +
            'Consider hiding the question instead or creating a new form.'
        );
    }
    
    await questionModel.remove(questionId);
    
    return true;
};

/**
 * Reorder questions within a form
 * @param {string} formId - Form UUID
 * @param {Array<{id: string, order_index: number}>} orderings - New orderings
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Array>} - Reordered questions
 */
const reorderQuestions = async (formId, orderings, userId) => {
    // Verify form exists and user owns it
    const form = await formModel.findById(formId);
    
    if (!form) {
        throw notFound('Form not found.');
    }
    
    if (form.user_id !== userId) {
        throw forbidden('You do not have permission to reorder questions in this form.');
    }
    
    // Validate all question IDs belong to this form
    for (const { id } of orderings) {
        const belongs = await questionModel.belongsToForm(id, formId);
        if (!belongs) {
            throw badRequest(`Question ${id} does not belong to this form.`);
        }
    }
    
    await questionModel.reorderQuestions(formId, orderings);
    
    // Return updated questions
    return await questionModel.findByFormId(formId);
};

/**
 * Helper function to validate options for question type
 * @param {string} type - Question type
 * @param {Array} options - Options array
 * @throws {ApiError} - If validation fails
 */
const validateOptionsForType = (type, options) => {
    const requiresOptions = questionModel.TYPES_REQUIRING_OPTIONS.includes(type);
    
    if (requiresOptions) {
        if (!options || !Array.isArray(options) || options.length === 0) {
            throw badRequest(
                `Question type '${type}' requires at least one option. ` +
                'Please provide an options array.'
            );
        }
        
        // Validate each option
        for (let i = 0; i < options.length; i++) {
            if (typeof options[i] !== 'string' || options[i].trim() === '') {
                throw badRequest(`Option at index ${i} must be a non-empty string.`);
            }
        }
        
        // Check for duplicate options
        const uniqueOptions = new Set(options.map(o => o.trim().toLowerCase()));
        if (uniqueOptions.size !== options.length) {
            throw badRequest('Options must be unique (no duplicates allowed).');
        }
    } else if (type === 'short_answer' && options && options.length > 0) {
        // Short answer doesn't need options, but we'll clear them
        // This is just a warning scenario - we can allow it
    }
};

/**
 * Get questions for form submission (public)
 * @param {string} formId - Form UUID
 * @returns {Promise<Array>} - Array of questions
 */
const getQuestionsForSubmission = async (formId) => {
    // Verify form exists and is published
    const form = await formModel.findById(formId);
    
    if (!form) {
        throw notFound('Form not found.');
    }
    
    if (form.status !== 'published') {
        throw forbidden('This form is not accepting responses.');
    }
    
    return await questionModel.findByFormId(formId);
};

module.exports = {
    createQuestion,
    getQuestionById,
    getQuestionsByFormId,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    getQuestionsForSubmission
};
