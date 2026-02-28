/**
 * Question Routes
 * 
 * Defines all routes for question CRUD operations.
 * Questions are nested under forms: /api/forms/:formId/questions/*
 */

const express = require('express');
const router = express.Router({ mergeParams: true }); // Important: mergeParams to access :formId

const questionController = require('../controllers/questionController');
const { authenticate, optionalAuth } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { questionValidators } = require('../utils/validators');

/**
 * @route   POST /api/forms/:formId/questions
 * @desc    Create a new question for a form
 * @access  Private (requires JWT and form ownership)
 */
router.post(
    '/',
    authenticate,
    questionValidators.create,
    validate,
    questionController.createQuestion
);

/**
 * @route   GET /api/forms/:formId/questions
 * @desc    Get all questions for a form
 * @access  Public (but unpublished forms require ownership)
 */
router.get(
    '/',
    optionalAuth,
    questionValidators.list,
    validate,
    questionController.getQuestions
);

/**
 * @route   PUT /api/forms/:formId/questions/reorder
 * @desc    Reorder questions within a form
 * @access  Private (requires JWT and form ownership)
 * @note    This route must come before /:id to avoid conflicts
 */
router.put(
    '/reorder',
    authenticate,
    questionValidators.reorder,
    validate,
    questionController.reorderQuestions
);

/**
 * @route   GET /api/forms/:formId/questions/:id
 * @desc    Get a specific question by ID
 * @access  Public (but unpublished forms require ownership)
 */
router.get(
    '/:id',
    optionalAuth,
    questionValidators.getById,
    validate,
    questionController.getQuestionById
);

/**
 * @route   PUT /api/forms/:formId/questions/:id
 * @desc    Update a question
 * @access  Private (requires JWT and form ownership)
 * @note    Business constraint: Cannot change type if form has submissions
 */
router.put(
    '/:id',
    authenticate,
    questionValidators.update,
    validate,
    questionController.updateQuestion
);

/**
 * @route   DELETE /api/forms/:formId/questions/:id
 * @desc    Delete a question
 * @access  Private (requires JWT and form ownership)
 * @note    Business constraint: Cannot delete if form has submissions
 */
router.delete(
    '/:id',
    authenticate,
    questionValidators.delete,
    validate,
    questionController.deleteQuestion
);

module.exports = router;
