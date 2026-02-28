/**
 * Error Handling Middlewares
 * 
 * Centralized error handling for the entire application.
 * This ensures consistent error responses and proper logging.
 */

const { errorResponse, ApiError } = require('../utils/apiResponse');

/**
 * 404 Not Found Handler
 * Catches requests to undefined routes
 */
const notFoundHandler = (req, res, next) => {
    const error = new ApiError(404, `Route ${req.originalUrl} not found`);
    next(error);
};

/**
 * Global Error Handler
 * Processes all errors and sends appropriate responses
 */
const errorHandler = (err, req, res, next) => {
    // Log error for debugging (in production, use proper logging service)
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', {
            message: err.message,
            stack: err.stack,
            statusCode: err.statusCode
        });
    } else {
        // In production, log error to monitoring service
        console.error('Error:', err.message);
    }

    // Handle specific error types
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errors = err.errors || null;

    // Handle PostgreSQL specific errors
    if (err.code) {
        switch (err.code) {
            case '23505': // Unique violation
                statusCode = 409;
                message = 'A record with this information already exists';
                break;
            case '23503': // Foreign key violation
                statusCode = 400;
                message = 'Referenced record does not exist';
                break;
            case '22P02': // Invalid text representation
                statusCode = 400;
                message = 'Invalid input format';
                break;
            case '23502': // Not null violation
                statusCode = 400;
                message = 'Required field is missing';
                break;
            default:
                if (process.env.NODE_ENV !== 'development') {
                    message = 'Database operation failed';
                }
        }
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token has expired';
    }

    // Handle validation errors from express-validator
    if (err.array && typeof err.array === 'function') {
        statusCode = 400;
        message = 'Validation failed';
        errors = err.array();
    }

    // Don't expose internal errors in production
    if (statusCode === 500 && process.env.NODE_ENV === 'production') {
        message = 'Internal Server Error';
        errors = null;
    }

    return errorResponse(res, statusCode, message, errors);
};

module.exports = {
    notFoundHandler,
    errorHandler
};
