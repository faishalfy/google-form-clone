/**
 * User Model
 * 
 * Handles all database operations related to users.
 * This is the data access layer - it only interacts with the database.
 */

const db = require('../config/database');

/**
 * Create a new user
 * @param {Object} userData - User data (name, email, password)
 * @returns {Promise<Object>} - Created user (without password)
 */
const create = async ({ name, email, password }) => {
    const query = `
        INSERT INTO users (name, email, password)
        VALUES ($1, $2, $3)
        RETURNING id, name, email, created_at, updated_at
    `;
    
    const result = await db.query(query, [name, email, password]);
    return result.rows[0];
};

/**
 * Find user by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>} - User object or null
 */
const findByEmail = async (email) => {
    const query = `
        SELECT id, name, email, password, created_at, updated_at
        FROM users
        WHERE email = $1
    `;
    
    const result = await db.query(query, [email]);
    return result.rows[0] || null;
};

/**
 * Find user by ID
 * @param {string} id - User UUID
 * @returns {Promise<Object|null>} - User object (without password) or null
 */
const findById = async (id) => {
    const query = `
        SELECT id, name, email, created_at, updated_at
        FROM users
        WHERE id = $1
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
};

/**
 * Check if email already exists
 * @param {string} email - Email to check
 * @returns {Promise<boolean>} - True if email exists
 */
const emailExists = async (email) => {
    const query = `
        SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) as exists
    `;
    
    const result = await db.query(query, [email]);
    return result.rows[0].exists;
};

/**
 * Update user
 * @param {string} id - User UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} - Updated user or null
 */
const update = async (id, updates) => {
    const allowedFields = ['name', 'email', 'password'];
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key) && value !== undefined) {
            fields.push(`${key} = $${paramIndex}`);
            values.push(value);
            paramIndex++;
        }
    }

    if (fields.length === 0) {
        return findById(id);
    }

    values.push(id);
    
    const query = `
        UPDATE users
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramIndex}
        RETURNING id, name, email, created_at, updated_at
    `;
    
    const result = await db.query(query, values);
    return result.rows[0] || null;
};

/**
 * Delete user
 * @param {string} id - User UUID
 * @returns {Promise<boolean>} - True if deleted
 */
const remove = async (id) => {
    const query = `
        DELETE FROM users
        WHERE id = $1
        RETURNING id
    `;
    
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
};

module.exports = {
    create,
    findByEmail,
    findById,
    emailExists,
    update,
    remove
};
