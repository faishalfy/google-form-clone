/**
 * Authentication Controller
 * 
 * Handles HTTP requests for authentication endpoints.
 * Controllers are thin - they delegate business logic to services.
 */

const authService = require('../services/authService');
const { successResponse } = require('../utils/apiResponse');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        
        const result = await authService.register({ name, email, password });
        
        return successResponse(
            res,
            201,
            'User registered successfully.',
            result
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        const result = await authService.login({ email, password });
        
        return successResponse(
            res,
            200,
            'Login successful.',
            result
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get current user profile
 * GET /api/auth/me
 * Protected route - requires authentication
 */
const getProfile = async (req, res, next) => {
    try {
        // req.user is set by the authenticate middleware
        const user = await authService.getProfile(req.user.id);
        
        return successResponse(
            res,
            200,
            'Profile retrieved successfully.',
            { user }
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getProfile
};
