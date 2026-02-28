/**
 * Authentication Service
 * 
 * Contains all business logic for authentication.
 * This layer sits between controllers and models.
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { conflict, unauthorized, badRequest } = require('../utils/apiResponse');

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} - Created user and token
 */
const register = async ({ name, email, password }) => {
    // Check if email already exists
    const emailExists = await userModel.emailExists(email);
    if (emailExists) {
        throw conflict('Email is already registered. Please use a different email or login.');
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await userModel.create({
        name,
        email,
        password: hashedPassword
    });

    // Generate JWT token
    const token = generateToken(user.id);

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.created_at
        },
        token
    };
};

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @returns {Promise<Object>} - User and token
 */
const login = async ({ email, password }) => {
    // Find user by email (includes password for verification)
    const user = await userModel.findByEmail(email);
    
    if (!user) {
        // Use generic message to prevent email enumeration
        throw unauthorized('Invalid email or password.');
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
        throw unauthorized('Invalid email or password.');
    }

    // Generate JWT token
    const token = generateToken(user.id);

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.created_at
        },
        token
    };
};

/**
 * Get current user profile
 * @param {string} userId - User ID from JWT
 * @returns {Promise<Object>} - User profile
 */
const getProfile = async (userId) => {
    const user = await userModel.findById(userId);
    
    if (!user) {
        throw unauthorized('User not found.');
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at
    };
};

/**
 * Generate JWT Token
 * @param {string} userId - User ID to encode
 * @returns {string} - JWT token
 */
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

/**
 * Verify JWT Token
 * @param {string} token - JWT token to verify
 * @returns {Object} - Decoded token payload
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw unauthorized('Invalid or expired token.');
    }
};

module.exports = {
    register,
    login,
    getProfile,
    generateToken,
    verifyToken
};
