/**
 * API Response Utilities
 * 
 * Standardized response format for all API endpoints.
 * This ensures consistent response structure across the entire application.
 */

/**
 * Success Response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {Object} data - Response data
 * @param {Object} meta - Additional metadata (pagination, etc.)
 */
const successResponse = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
    const response = {
        success: true,
        message,
        data
    };

    if (meta) {
        response.meta = meta;
    }

    return res.status(statusCode).json(response);
};

/**
 * Error Response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Object} errors - Detailed error information
 */
const errorResponse = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
    const response = {
        success: false,
        message
    };

    if (errors) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
};

/**
 * Custom API Error Class
 * Allows throwing errors with custom status codes
 */
class ApiError extends Error {
    constructor(statusCode, message, errors = null) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = true; // Distinguishes operational errors from programming errors

        Error.captureStackTrace(this, this.constructor);
    }
}

// Common error factory functions
const badRequest = (message = 'Bad Request', errors = null) => new ApiError(400, message, errors);
const unauthorized = (message = 'Unauthorized') => new ApiError(401, message);
const forbidden = (message = 'Forbidden') => new ApiError(403, message);
const notFound = (message = 'Resource not found') => new ApiError(404, message);
const conflict = (message = 'Conflict') => new ApiError(409, message);
const internalError = (message = 'Internal Server Error') => new ApiError(500, message);

module.exports = {
    successResponse,
    errorResponse,
    ApiError,
    badRequest,
    unauthorized,
    forbidden,
    notFound,
    conflict,
    internalError
};
