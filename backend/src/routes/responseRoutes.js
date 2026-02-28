/**
 * Response Routes
 * 
 * Defines all routes for form response operations.
 * Responses are nested under forms: /api/forms/:formId/responses/*
 * User's own responses: /api/responses/me
 */

const express = require('express');
const router = express.Router({ mergeParams: true }); // Important: mergeParams to access :formId

const responseController = require('../controllers/responseController');
const { authenticate, optionalAuth } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { responseValidators } = require('../utils/validators');

/**
 * @route   POST /api/forms/:formId/submit
 * @desc    Submit a response to a form
 * @access  Public (optionally authenticated for tracking)
 */
router.post(
    '/submit',
    optionalAuth,
    responseValidators.submit,
    validate,
    responseController.submitResponse
);

/**
 * @route   GET /api/forms/:formId/responses
 * @desc    Get all responses for a form (form owner only)
 * @access  Private (requires JWT and form ownership)
 */
router.get(
    '/responses',
    authenticate,
    responseValidators.list,
    validate,
    responseController.getResponses
);

/**
 * @route   GET /api/forms/:formId/responses/export
 * @desc    Export all responses with answers for a form
 * @access  Private (requires JWT and form ownership)
 */
router.get(
    '/responses/export',
    authenticate,
    responseValidators.list,
    validate,
    responseController.exportResponses
);

/**
 * @route   GET /api/forms/:formId/responses/:id
 * @desc    Get a specific response by ID
 * @access  Private (respondent or form owner)
 */
router.get(
    '/responses/:id',
    authenticate,
    responseValidators.getById,
    validate,
    responseController.getResponseById
);

/**
 * @route   DELETE /api/forms/:formId/responses/:id
 * @desc    Delete a response (form owner only)
 * @access  Private (requires JWT and form ownership)
 */
router.delete(
    '/responses/:id',
    authenticate,
    responseValidators.delete,
    validate,
    responseController.deleteResponse
);

/**
 * @route   GET /api/forms/:formId/questions/:questionId/statistics
 * @desc    Get answer statistics for a question
 * @access  Private (requires JWT and form ownership)
 */
router.get(
    '/questions/:questionId/statistics',
    authenticate,
    responseValidators.statistics,
    validate,
    responseController.getAnswerStatistics
);

module.exports = router;
