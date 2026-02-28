/**
 * Form Model
 * 
 * Handles all database operations related to forms.
 * This is the data access layer - it only interacts with the database.
 * 
 * Level 2 Updates:
 * - Added status field support (draft, published, closed)
 * - Added filtering by status
 * - Added sorting options (asc/desc)
 * - Added hasSubmissions check for business constraints
 */

const db = require('../config/database');

/**
 * Valid form statuses
 */
const VALID_STATUSES = ['draft', 'published', 'closed'];

/**
 * Valid sort orders
 */
const VALID_SORT_ORDERS = ['asc', 'desc'];

/**
 * Create a new form
 * @param {Object} formData - Form data
 * @param {string} formData.title - Form title
 * @param {string} formData.description - Form description
 * @param {string} formData.user_id - Owner's user ID
 * @param {string} formData.status - Form status (draft, published, closed)
 * @returns {Promise<Object>} - Created form
 */
const create = async ({ title, description, user_id, status = 'draft' }) => {
    const query = `
        INSERT INTO forms (title, description, user_id, status, is_published)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, title, description, status, is_published, user_id, created_at, updated_at
    `;
    
    const isPublished = status === 'published';
    const result = await db.query(query, [title, description || null, user_id, status, isPublished]);
    return result.rows[0];
};

/**
 * Find form by ID
 * @param {string} id - Form UUID
 * @returns {Promise<Object|null>} - Form object or null
 */
const findById = async (id) => {
    const query = `
        SELECT 
            f.id, 
            f.title, 
            f.description, 
            f.status,
            f.is_published, 
            f.user_id,
            f.created_at, 
            f.updated_at,
            u.name as owner_name,
            u.email as owner_email
        FROM forms f
        JOIN users u ON f.user_id = u.id
        WHERE f.id = $1
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
};

/**
 * Find all forms by user ID with pagination, filtering, and sorting
 * @param {string} userId - User UUID
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (1-based)
 * @param {number} options.limit - Items per page
 * @param {string} options.search - Search term for title (ILIKE)
 * @param {string} options.status - Filter by status (draft, published, closed)
 * @param {string} options.sort - Sort order for created_at (asc, desc)
 * @returns {Promise<Object>} - { forms, total, page, limit, totalPages }
 */
const findByUserId = async (userId, { page = 1, limit = 10, search = '', status = '', sort = 'desc' } = {}) => {
    const offset = (page - 1) * limit;
    
    // Build the WHERE clause dynamically
    let whereClause = 'WHERE f.user_id = $1';
    const params = [userId];
    let paramIndex = 2;
    
    // Search filter (partial match on title using ILIKE for case-insensitive search)
    if (search) {
        whereClause += ` AND f.title ILIKE $${paramIndex}`;
        params.push(`%${search}%`);
        paramIndex++;
    }
    
    // Status filter
    if (status && VALID_STATUSES.includes(status)) {
        whereClause += ` AND f.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
    }
    
    // Validate sort order (prevent SQL injection)
    const sortOrder = VALID_SORT_ORDERS.includes(sort.toLowerCase()) ? sort.toUpperCase() : 'DESC';
    
    // Get total count
    const countQuery = `
        SELECT COUNT(*) as total
        FROM forms f
        ${whereClause}
    `;
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);
    
    // Get paginated forms with sorting and question count
    const formsQuery = `
        SELECT 
            f.id, 
            f.title, 
            f.description, 
            f.status,
            f.is_published, 
            f.user_id,
            f.created_at, 
            f.updated_at,
            (SELECT COUNT(*) FROM questions q WHERE q.form_id = f.id) as question_count
        FROM forms f
        ${whereClause}
        ORDER BY f.created_at ${sortOrder}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const formsResult = await db.query(formsQuery, [...params, limit, offset]);
    
    return {
        forms: formsResult.rows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};

/**
 * Find all published forms (public access)
 * @param {Object} options - Query options
 * @param {string} options.search - Search term for title (ILIKE)
 * @param {string} options.sort - Sort order for created_at (asc, desc)
 * @returns {Promise<Object>} - Paginated forms
 */
const findPublished = async ({ page = 1, limit = 10, search = '', sort = 'desc' } = {}) => {
    const offset = (page - 1) * limit;
    
    let whereClause = "WHERE f.status = 'published'";
    const params = [];
    let paramIndex = 1;
    
    if (search) {
        whereClause += ` AND f.title ILIKE $${paramIndex}`;
        params.push(`%${search}%`);
        paramIndex++;
    }
    
    // Validate sort order
    const sortOrder = VALID_SORT_ORDERS.includes(sort.toLowerCase()) ? sort.toUpperCase() : 'DESC';
    
    // Get total count
    const countQuery = `
        SELECT COUNT(*) as total
        FROM forms f
        ${whereClause}
    `;
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);
    
    // Get paginated forms
    const formsQuery = `
        SELECT 
            f.id, 
            f.title, 
            f.description, 
            f.status,
            f.is_published, 
            f.user_id,
            f.created_at, 
            f.updated_at,
            u.name as owner_name
        FROM forms f
        JOIN users u ON f.user_id = u.id
        ${whereClause}
        ORDER BY f.created_at ${sortOrder}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const formsResult = await db.query(formsQuery, [...params, limit, offset]);
    
    return {
        forms: formsResult.rows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};

/**
 * Update form
 * @param {string} id - Form UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} - Updated form or null
 */
const update = async (id, updates) => {
    const allowedFields = ['title', 'description', 'status', 'is_published'];
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
    
    // If status is being updated, sync is_published accordingly
    if (updates.status !== undefined) {
        const isPublished = updates.status === 'published';
        if (!fields.some(f => f.includes('is_published'))) {
            fields.push(`is_published = $${paramIndex}`);
            values.push(isPublished);
            paramIndex++;
        }
    }

    if (fields.length === 0) {
        return findById(id);
    }

    values.push(id);
    
    const query = `
        UPDATE forms
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramIndex}
        RETURNING id, title, description, status, is_published, user_id, created_at, updated_at
    `;
    
    const result = await db.query(query, values);
    return result.rows[0] || null;
};

/**
 * Delete form
 * @param {string} id - Form UUID
 * @returns {Promise<boolean>} - True if deleted
 */
const remove = async (id) => {
    const query = `
        DELETE FROM forms
        WHERE id = $1
        RETURNING id
    `;
    
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
};

/**
 * Check if user owns the form
 * @param {string} formId - Form UUID
 * @param {string} userId - User UUID
 * @returns {Promise<boolean>} - True if user owns the form
 */
const isOwner = async (formId, userId) => {
    const query = `
        SELECT EXISTS(
            SELECT 1 FROM forms 
            WHERE id = $1 AND user_id = $2
        ) as is_owner
    `;
    
    const result = await db.query(query, [formId, userId]);
    return result.rows[0].is_owner;
};

/**
 * Check if form has any submissions (for business constraints)
 * This is crucial for preventing modifications to questions after submissions exist
 * @param {string} formId - Form UUID
 * @returns {Promise<boolean>} - True if form has at least one submission
 */
const hasSubmissions = async (formId) => {
    const query = `
        SELECT EXISTS(
            SELECT 1 FROM responses 
            WHERE form_id = $1
        ) as has_submissions
    `;
    
    const result = await db.query(query, [formId]);
    return result.rows[0].has_submissions;
};

/**
 * Get submission count for a form
 * @param {string} formId - Form UUID
 * @returns {Promise<number>} - Number of submissions
 */
const getSubmissionCount = async (formId) => {
    const query = `
        SELECT COUNT(*) as count
        FROM responses
        WHERE form_id = $1
    `;
    
    const result = await db.query(query, [formId]);
    return parseInt(result.rows[0].count);
};

module.exports = {
    create,
    findById,
    findByUserId,
    findPublished,
    update,
    remove,
    isOwner,
    hasSubmissions,
    getSubmissionCount,
    VALID_STATUSES,
    VALID_SORT_ORDERS
};
