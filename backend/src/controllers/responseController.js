/**
 * Response Controller
 * 
 * Handles HTTP requests for form response endpoints.
 * Responses are nested under forms: /api/forms/:formId/responses
 */

const responseService = require('../services/responseService');
const { successResponse } = require('../utils/apiResponse');

/**
 * Submit a response to a form
 * POST /api/forms/:formId/submit
 * Public route (optionally authenticated for tracking)
 */
const submitResponse = async (req, res, next) => {
    try {
        const { formId } = req.params;
        const { answers } = req.body;
        // req.user may be null for anonymous submissions
        const userId = req.user ? req.user.id : null;
        
        const response = await responseService.submitResponse(
            formId,
            { answers },
            userId
        );
        
        return successResponse(
            res,
            201,
            response.message,
            { 
                response_id: response.id,
                form_id: response.form_id,
                submitted_at: response.submitted_at,
                answers_count: response.answers_count
            }
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get all responses for a form (form owner only)
 * GET /api/forms/:formId/responses
 * Protected route - requires authentication and form ownership
 */
const getResponses = async (req, res, next) => {
    try {
        const { formId } = req.params;
        const { page, limit, sort } = req.query;
        const userId = req.user.id;
        
        const result = await responseService.getResponsesByFormId(
            formId,
            userId,
            { page, limit, sort }
        );
        
        return successResponse(
            res,
            200,
            'Responses retrieved successfully.',
            { responses: result.responses },
            { pagination: result.pagination }
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get response by ID
 * GET /api/forms/:formId/responses/:id
 * Protected route - requires authentication (respondent or form owner)
 */
const getResponseById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const response = await responseService.getResponseById(id, userId);
        
        return successResponse(
            res,
            200,
            'Response retrieved successfully.',
            { response }
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Export all responses for a form (form owner only)
 * GET /api/forms/:formId/responses/export
 * Protected route - requires authentication and form ownership
 */
const exportResponses = async (req, res, next) => {
    try {
        const { formId } = req.params;
        const userId = req.user.id;
        
        const responses = await responseService.getResponsesForExport(formId, userId);
        
        return successResponse(
            res,
            200,
            'Responses exported successfully.',
            { 
                responses,
                total_count: responses.length
            }
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Delete response (form owner only)
 * DELETE /api/forms/:formId/responses/:id
 * Protected route - requires authentication and form ownership
 */
const deleteResponse = async (req, res, next) => {
    try {
        const { formId, id } = req.params;
        const userId = req.user.id;
        
        await responseService.deleteResponse(formId, id, userId);
        
        return successResponse(
            res,
            200,
            'Response deleted successfully.',
            null
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get answer statistics for a question (form owner only)
 * GET /api/forms/:formId/questions/:questionId/statistics
 * Protected route - requires authentication and form ownership
 */
const getAnswerStatistics = async (req, res, next) => {
    try {
        const { formId, questionId } = req.params;
        const userId = req.user.id;
        
        const statistics = await responseService.getAnswerStatistics(
            formId,
            questionId,
            userId
        );
        
        return successResponse(
            res,
            200,
            'Statistics retrieved successfully.',
            { statistics }
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get user's own responses
 * GET /api/responses/me
 * Protected route - requires authentication
 */
const getMyResponses = async (req, res, next) => {
    try {
        const { page, limit } = req.query;
        const userId = req.user.id;
        
        const result = await responseService.getUserResponses(userId, { page, limit });
        
        return successResponse(
            res,
            200,
            'Your responses retrieved successfully.',
            { responses: result.responses },
            { pagination: result.pagination }
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    submitResponse,
    getResponses,
    getResponseById,
    exportResponses,
    deleteResponse,
    getAnswerStatistics,
    getMyResponses
};
