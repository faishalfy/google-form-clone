/**
 * Question Controller
 * 
 * Handles HTTP requests for question endpoints.
 * Questions are nested under forms: /api/forms/:formId/questions
 */

const questionService = require('../services/questionService');
const { successResponse } = require('../utils/apiResponse');

/**
 * Create a new question
 * POST /api/forms/:formId/questions
 * Protected route - requires authentication and form ownership
 */
const createQuestion = async (req, res, next) => {
    try {
        const { formId } = req.params;
        const { title, type, options, is_required, order_index } = req.body;
        const userId = req.user.id;
        
        const question = await questionService.createQuestion(
            formId,
            { title, type, options, is_required, order_index },
            userId
        );
        
        return successResponse(
            res,
            201,
            'Question created successfully.',
            { question }
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get all questions for a form
 * GET /api/forms/:formId/questions
 * Public route (but unpublished forms require ownership)
 */
const getQuestions = async (req, res, next) => {
    try {
        const { formId } = req.params;
        const userId = req.user ? req.user.id : null;
        
        const questions = await questionService.getQuestionsByFormId(formId, userId);
        
        return successResponse(
            res,
            200,
            'Questions retrieved successfully.',
            { 
                questions,
                count: questions.length 
            }
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get question by ID
 * GET /api/forms/:formId/questions/:id
 * Public route (but unpublished forms require ownership)
 */
const getQuestionById = async (req, res, next) => {
    try {
        const { formId, id } = req.params;
        const userId = req.user ? req.user.id : null;
        
        const question = await questionService.getQuestionById(formId, id, userId);
        
        return successResponse(
            res,
            200,
            'Question retrieved successfully.',
            { question }
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Update question
 * PUT /api/forms/:formId/questions/:id
 * Protected route - requires authentication and form ownership
 * 
 * Business constraint: Cannot change question type if form has submissions
 */
const updateQuestion = async (req, res, next) => {
    try {
        const { formId, id } = req.params;
        const { title, type, options, is_required, order_index } = req.body;
        const userId = req.user.id;
        
        const question = await questionService.updateQuestion(
            formId,
            id,
            { title, type, options, is_required, order_index },
            userId
        );
        
        return successResponse(
            res,
            200,
            'Question updated successfully.',
            { question }
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Delete question
 * DELETE /api/forms/:formId/questions/:id
 * Protected route - requires authentication and form ownership
 * 
 * Business constraint: Cannot delete if form has submissions
 */
const deleteQuestion = async (req, res, next) => {
    try {
        const { formId, id } = req.params;
        const userId = req.user.id;
        
        await questionService.deleteQuestion(formId, id, userId);
        
        return successResponse(
            res,
            200,
            'Question deleted successfully.',
            null
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Reorder questions
 * PUT /api/forms/:formId/questions/reorder
 * Protected route - requires authentication and form ownership
 */
const reorderQuestions = async (req, res, next) => {
    try {
        const { formId } = req.params;
        const { orderings } = req.body;
        const userId = req.user.id;
        
        const questions = await questionService.reorderQuestions(formId, orderings, userId);
        
        return successResponse(
            res,
            200,
            'Questions reordered successfully.',
            { questions }
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createQuestion,
    getQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    reorderQuestions
};
