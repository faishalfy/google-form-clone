/**
 * Authentication Middleware
 * 
 * This middleware protects routes by verifying JWT tokens.
 * It extracts the user information and attaches it to the request object.
 */

const jwt = require('jsonwebtoken');
const { unauthorized, forbidden } = require('../utils/apiResponse');
const userModel = require('../models/userModel');

/**
 * Authenticate JWT Token
 * 
 * This middleware:
 * 1. Extracts the token from the Authorization header
 * 2. Verifies the token is valid
 * 3. Checks if the user still exists
 * 4. Attaches user info to req.user
 */
const authenticate = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw unauthorized('Access denied. No token provided.');
        }

        // Extract token (remove "Bearer " prefix)
        const token = authHeader.split(' ')[1];

        if (!token) {
            throw unauthorized('Access denied. No token provided.');
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user still exists (they might have been deleted)
        const user = await userModel.findById(decoded.userId);
        
        if (!user) {
            throw unauthorized('User no longer exists.');
        }

        // Attach user info to request object
        // This makes user data available in controllers
        req.user = {
            id: user.id,
            email: user.email,
            name: user.name
        };

        // Continue to the next middleware/controller
        next();
    } catch (error) {
        // Handle specific JWT errors
        if (error.name === 'JsonWebTokenError') {
            return next(unauthorized('Invalid token.'));
        }
        if (error.name === 'TokenExpiredError') {
            return next(unauthorized('Token has expired. Please login again.'));
        }
        
        next(error);
    }
};

/**
 * Optional Authentication
 * 
 * Similar to authenticate, but doesn't fail if no token is provided.
 * Useful for routes that behave differently for logged-in vs anonymous users.
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token, but that's okay - continue without user
            req.user = null;
            return next();
        }

        const token = authHeader.split(' ')[1];
        
        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.userId);
        
        req.user = user ? {
            id: user.id,
            email: user.email,
            name: user.name
        } : null;

        next();
    } catch (error) {
        // Token invalid, but optional auth - continue without user
        req.user = null;
        next();
    }
};

module.exports = {
    authenticate,
    optionalAuth
};
