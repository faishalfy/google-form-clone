/**
 * Input Validation Rules
 * 
 * This file contains all validation rules using express-validator.
 * Keeping validations centralized makes them reusable and maintainable.
 * 
 * Level 2 Updates:
 * - Added status filter validation for forms
 * - Added sort order validation
 * - Added question validators
 * - Added response validators
 */

const { body, param, query } = require('express-validator');

/**
 * Valid form statuses
 */
const VALID_FORM_STATUSES = ['draft', 'published', 'closed'];

/**
 * Valid question types
 */
const VALID_QUESTION_TYPES = ['short_answer', 'multiple_choice', 'checkbox', 'dropdown'];

/**
 * Question types that require options
 */
const TYPES_REQUIRING_OPTIONS = ['multiple_choice', 'checkbox', 'dropdown'];

/**
 * Authentication Validators
 */
const authValidators = {
    // Registration validation rules
    register: [
        body('name')
            .trim()
            .notEmpty().withMessage('Name is required')
            .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
            .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
        
        body('email')
            .trim()
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Please provide a valid email address')
            .normalizeEmail()
            .isLength({ max: 255 }).withMessage('Email must not exceed 255 characters'),
        
        body('password')
            .notEmpty().withMessage('Password is required')
            .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
    ],

    // Login validation rules
    login: [
        body('email')
            .trim()
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Please provide a valid email address')
            .normalizeEmail(),
        
        body('password')
            .notEmpty().withMessage('Password is required')
    ]
};

/**
 * Form Validators
 */
const formValidators = {
    // Create form validation rules
    create: [
        body('title')
            .trim()
            .notEmpty().withMessage('Form title is required')
            .isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters'),
        
        body('description')
            .optional()
            .trim()
            .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
        
        body('status')
            .optional()
            .trim()
            .isIn(VALID_FORM_STATUSES).withMessage(`Status must be one of: ${VALID_FORM_STATUSES.join(', ')}`)
    ],

    // Update form validation rules
    update: [
        param('id')
            .isUUID().withMessage('Invalid form ID format'),
        
        body('title')
            .optional()
            .trim()
            .notEmpty().withMessage('Form title cannot be empty')
            .isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters'),
        
        body('description')
            .optional()
            .trim()
            .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
        
        body('status')
            .optional()
            .trim()
            .isIn(VALID_FORM_STATUSES).withMessage(`Status must be one of: ${VALID_FORM_STATUSES.join(', ')}`),
        
        body('is_published')
            .optional()
            .isBoolean().withMessage('is_published must be a boolean value')
    ],

    // Get form by ID validation
    getById: [
        param('id')
            .isUUID().withMessage('Invalid form ID format')
    ],

    // Delete form validation
    delete: [
        param('id')
            .isUUID().withMessage('Invalid form ID format')
    ],

    // List forms validation (pagination, filtering, sorting)
    list: [
        query('page')
            .optional()
            .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
        
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
        
        query('search')
            .optional()
            .trim()
            .isLength({ max: 100 }).withMessage('Search term must not exceed 100 characters'),
        
        query('status')
            .optional()
            .trim()
            .isIn(VALID_FORM_STATUSES).withMessage(`Status filter must be one of: ${VALID_FORM_STATUSES.join(', ')}`),
        
        query('sort')
            .optional()
            .trim()
            .toLowerCase()
            .isIn(['asc', 'desc']).withMessage('Sort must be either "asc" or "desc"')
    ]
};

/**
 * Question Validators
 */
const questionValidators = {
    // Create question validation rules
    create: [
        param('formId')
            .isUUID().withMessage('Invalid form ID format'),
        
        body('title')
            .trim()
            .notEmpty().withMessage('Question title is required')
            .isLength({ min: 1, max: 500 }).withMessage('Title must be between 1 and 500 characters'),
        
        body('type')
            .trim()
            .notEmpty().withMessage('Question type is required')
            .isIn(VALID_QUESTION_TYPES).withMessage(`Type must be one of: ${VALID_QUESTION_TYPES.join(', ')}`),
        
        body('options')
            .optional()
            .isArray().withMessage('Options must be an array')
            .custom((value, { req }) => {
                const type = req.body.type;
                
                // Check if type requires options
                if (TYPES_REQUIRING_OPTIONS.includes(type)) {
                    if (!value || value.length === 0) {
                        throw new Error(`Options are required for question type '${type}'`);
                    }
                    
                    // Validate each option
                    for (let i = 0; i < value.length; i++) {
                        if (typeof value[i] !== 'string' || value[i].trim() === '') {
                            throw new Error(`Option at index ${i} must be a non-empty string`);
                        }
                    }
                    
                    // Check for duplicates
                    const uniqueOptions = new Set(value.map(o => o.trim().toLowerCase()));
                    if (uniqueOptions.size !== value.length) {
                        throw new Error('Options must be unique (no duplicates allowed)');
                    }
                }
                
                return true;
            }),
        
        body('is_required')
            .optional()
            .isBoolean().withMessage('is_required must be a boolean value'),
        
        body('order_index')
            .optional()
            .isInt({ min: 0 }).withMessage('order_index must be a non-negative integer')
    ],

    // Update question validation rules
    update: [
        param('formId')
            .isUUID().withMessage('Invalid form ID format'),
        
        param('id')
            .isUUID().withMessage('Invalid question ID format'),
        
        body('title')
            .optional()
            .trim()
            .notEmpty().withMessage('Question title cannot be empty')
            .isLength({ min: 1, max: 500 }).withMessage('Title must be between 1 and 500 characters'),
        
        body('type')
            .optional()
            .trim()
            .isIn(VALID_QUESTION_TYPES).withMessage(`Type must be one of: ${VALID_QUESTION_TYPES.join(', ')}`),
        
        body('options')
            .optional()
            .isArray().withMessage('Options must be an array'),
        
        body('is_required')
            .optional()
            .isBoolean().withMessage('is_required must be a boolean value'),
        
        body('order_index')
            .optional()
            .isInt({ min: 0 }).withMessage('order_index must be a non-negative integer')
    ],

    // Get question by ID validation
    getById: [
        param('formId')
            .isUUID().withMessage('Invalid form ID format'),
        
        param('id')
            .isUUID().withMessage('Invalid question ID format')
    ],

    // Delete question validation
    delete: [
        param('formId')
            .isUUID().withMessage('Invalid form ID format'),
        
        param('id')
            .isUUID().withMessage('Invalid question ID format')
    ],

    // List questions validation
    list: [
        param('formId')
            .isUUID().withMessage('Invalid form ID format')
    ],

    // Reorder questions validation
    reorder: [
        param('formId')
            .isUUID().withMessage('Invalid form ID format'),
        
        body('orderings')
            .isArray({ min: 1 }).withMessage('Orderings must be a non-empty array'),
        
        body('orderings.*.id')
            .isUUID().withMessage('Each ordering must have a valid question ID'),
        
        body('orderings.*.order_index')
            .isInt({ min: 0 }).withMessage('Each ordering must have a valid order_index')
    ]
};

/**
 * Response Validators
 */
const responseValidators = {
    // Submit response validation rules
    submit: [
        param('formId')
            .isUUID().withMessage('Invalid form ID format'),
        
        body('answers')
            .isArray().withMessage('Answers must be an array')
            .custom((value) => {
                if (!value || value.length === 0) {
                    // Empty answers might be valid if no questions are required
                    return true;
                }
                
                for (let i = 0; i < value.length; i++) {
                    const answer = value[i];
                    
                    if (!answer.question_id) {
                        throw new Error(`Answer at index ${i} must have a question_id`);
                    }
                    
                    // Value validation will be done in service layer based on question type
                }
                
                return true;
            }),
        
        body('answers.*.question_id')
            .optional()
            .isUUID().withMessage('question_id must be a valid UUID')
    ],

    // Get response by ID validation
    getById: [
        param('formId')
            .isUUID().withMessage('Invalid form ID format'),
        
        param('id')
            .isUUID().withMessage('Invalid response ID format')
    ],

    // List responses validation
    list: [
        param('formId')
            .isUUID().withMessage('Invalid form ID format'),
        
        query('page')
            .optional()
            .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
        
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
        
        query('sort')
            .optional()
            .trim()
            .toLowerCase()
            .isIn(['asc', 'desc']).withMessage('Sort must be either "asc" or "desc"')
    ],

    // Delete response validation
    delete: [
        param('formId')
            .isUUID().withMessage('Invalid form ID format'),
        
        param('id')
            .isUUID().withMessage('Invalid response ID format')
    ],

    // Get statistics validation
    statistics: [
        param('formId')
            .isUUID().withMessage('Invalid form ID format'),
        
        param('questionId')
            .isUUID().withMessage('Invalid question ID format')
    ]
};

/**
 * Submission Validators (Level 3 Feature)
 * 
 * Used for form owner to view submissions
 */
const submissionValidators = {
    // List submissions validation
    list: [
        param('formId')
            .isUUID().withMessage('Invalid form ID format'),
        
        query('page')
            .optional()
            .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
        
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
        
        query('sort')
            .optional()
            .trim()
            .toLowerCase()
            .isIn(['asc', 'desc']).withMessage('Sort must be either "asc" or "desc"')
    ],

    // Get submission detail validation
    getById: [
        param('formId')
            .isUUID().withMessage('Invalid form ID format'),
        
        param('submissionId')
            .isUUID().withMessage('Invalid submission ID format')
    ]
};

module.exports = {
    authValidators,
    formValidators,
    questionValidators,
    responseValidators,
    submissionValidators,
    VALID_FORM_STATUSES,
    VALID_QUESTION_TYPES,
    TYPES_REQUIRING_OPTIONS
};
