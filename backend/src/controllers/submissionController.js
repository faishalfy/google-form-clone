/**
 * Submission Controller
 * 
 * LEVEL 3 FEATURE: Handles HTTP requests for submission endpoints
 * 
 * Endpoints:
 * - GET /forms/:formId/submissions - List submissions (form owner only)
 * - GET /forms/:formId/submissions/:submissionId - Get submission detail (form owner only)
 * 
 * SECURITY:
 * - All endpoints require authentication
 * - Ownership verification in service layer
 * - Returns appropriate HTTP status codes
 * 
 * ERROR HANDLING:
 * - 401 Unauthorized: No token or invalid token
 * - 403 Forbidden: User is not the form owner
 * - 404 Not Found: Form or submission not found
 */

const submissionService = require('../services/submissionService');
const { successResponse } = require('../utils/apiResponse');

/**
 * List all submissions for a form
 * GET /api/forms/:formId/submissions
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 * 
 * AUTHORIZATION: Form owner only
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 100)
 * - sort: Sort order by submitted_at (asc/desc, default: desc)
 */
const listSubmissions = async (req, res, next) => {
    try {
        const { formId } = req.params;
        const { page, limit, sort } = req.query;
        const userId = req.user.id;
        
        const result = await submissionService.listSubmissions(
            formId,
            userId,
            { page, limit, sort }
        );
        
        return successResponse(
            res,
            200,
            'Submissions retrieved successfully.',
            { submissions: result.submissions },
            { pagination: result.pagination }
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get detailed submission with all answers
 * GET /api/forms/:formId/submissions/:submissionId
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 * 
 * AUTHORIZATION: Form owner only
 * 
 * Returns:
 * - Submission metadata
 * - Respondent info (if authenticated submission)
 * - All answers with question titles and types
 * 
 * OPTIMIZED: Single query with JOINs, no N+1 problem
 */
const getSubmissionDetail = async (req, res, next) => {
    try {
        const { formId, submissionId } = req.params;
        const userId = req.user.id;
        
        const submission = await submissionService.getSubmissionDetail(
            formId,
            submissionId,
            userId
        );
        
        return successResponse(
            res,
            200,
            'Submission retrieved successfully.',
            { submission }
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    listSubmissions,
    getSubmissionDetail
};
