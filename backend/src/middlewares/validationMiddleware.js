/**
 * Validation Middleware
 * 
 * Processes validation results from express-validator.
 * Returns standardized error responses for validation failures.
 */

const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Validate Request
 * 
 * This middleware checks for validation errors and returns them in a standardized format.
 * It should be used after validation rules (from validators.js) in route definitions.
 * 
 * @returns {Function} Express middleware function
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Format errors for better readability
        const formattedErrors = errors.array().map(error => ({
            field: error.path,
            message: error.msg,
            value: error.value
        }));

        return errorResponse(res, 400, 'Validation failed', formattedErrors);
    }

    next();
};

module.exports = {
    validate
};
