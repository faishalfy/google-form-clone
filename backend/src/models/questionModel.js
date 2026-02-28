/**
 * Question Model
 * 
 * Handles all database operations related to questions.
 * Questions belong to forms and can have different types:
 * - short_answer: Text input
 * - multiple_choice: Single selection from options
 * - checkbox: Multiple selections from options
 * - dropdown: Single selection from dropdown options
 */

const db = require('../config/database');

/**
 * Valid question types
 */
const VALID_TYPES = ['short_answer', 'multiple_choice', 'checkbox', 'dropdown'];

/**
 * Question types that require options
 */
const TYPES_REQUIRING_OPTIONS = ['multiple_choice', 'checkbox', 'dropdown'];

/**
 * Create a new question
 * @param {Object} questionData - Question data
 * @param {string} questionData.form_id - Form UUID
 * @param {string} questionData.title - Question title
 * @param {string} questionData.type - Question type
 * @param {Array} questionData.options - Options for choice-based questions
 * @param {boolean} questionData.is_required - Whether answer is required
 * @param {number} questionData.order_index - Display order
 * @returns {Promise<Object>} - Created question
 */
const create = async ({ form_id, title, type, options = null, is_required = false, order_index = 0 }) => {
    const query = `
        INSERT INTO questions (form_id, title, type, options, is_required, order_index)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, form_id, title, type, options, is_required, order_index, created_at, updated_at
    `;
    
    // Convert options array to JSONB format
    const optionsJson = options ? JSON.stringify(options) : null;
    
    const result = await db.query(query, [form_id, title, type, optionsJson, is_required, order_index]);
    return result.rows[0];
};

/**
 * Find question by ID
 * @param {string} id - Question UUID
 * @returns {Promise<Object|null>} - Question object or null
 */
const findById = async (id) => {
    const query = `
        SELECT 
            q.id, 
            q.form_id, 
            q.title, 
            q.type, 
            q.options, 
            q.is_required,
            q.order_index,
            q.created_at, 
            q.updated_at
        FROM questions q
        WHERE q.id = $1
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
};

/**
 * Find all questions for a form
 * @param {string} formId - Form UUID
 * @param {Object} options - Query options
 * @param {boolean} options.includeDeleted - Include soft-deleted questions
 * @returns {Promise<Array>} - Array of questions
 */
const findByFormId = async (formId, { orderBy = 'order_index', sort = 'asc' } = {}) => {
    const sortOrder = sort.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    const validOrderBy = ['order_index', 'created_at'].includes(orderBy) ? orderBy : 'order_index';
    
    const query = `
        SELECT 
            q.id, 
            q.form_id, 
            q.title, 
            q.type, 
            q.options, 
            q.is_required,
            q.order_index,
            q.created_at, 
            q.updated_at
        FROM questions q
        WHERE q.form_id = $1
        ORDER BY q.${validOrderBy} ${sortOrder}
    `;
    
    const result = await db.query(query, [formId]);
    return result.rows;
};

/**
 * Update question
 * @param {string} id - Question UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} - Updated question or null
 */
const update = async (id, updates) => {
    const allowedFields = ['title', 'type', 'options', 'is_required', 'order_index'];
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key) && value !== undefined) {
            if (key === 'options') {
                fields.push(`${key} = $${paramIndex}`);
                values.push(value ? JSON.stringify(value) : null);
            } else {
                fields.push(`${key} = $${paramIndex}`);
                values.push(value);
            }
            paramIndex++;
        }
    }

    if (fields.length === 0) {
        return findById(id);
    }

    values.push(id);
    
    const query = `
        UPDATE questions
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramIndex}
        RETURNING id, form_id, title, type, options, is_required, order_index, created_at, updated_at
    `;
    
    const result = await db.query(query, values);
    return result.rows[0] || null;
};

/**
 * Delete question
 * @param {string} id - Question UUID
 * @returns {Promise<boolean>} - True if deleted
 */
const remove = async (id) => {
    const query = `
        DELETE FROM questions
        WHERE id = $1
        RETURNING id
    `;
    
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
};

/**
 * Check if question belongs to form
 * @param {string} questionId - Question UUID
 * @param {string} formId - Form UUID
 * @returns {Promise<boolean>} - True if question belongs to form
 */
const belongsToForm = async (questionId, formId) => {
    const query = `
        SELECT EXISTS(
            SELECT 1 FROM questions 
            WHERE id = $1 AND form_id = $2
        ) as belongs
    `;
    
    const result = await db.query(query, [questionId, formId]);
    return result.rows[0].belongs;
};

/**
 * Get the next order index for a new question in a form
 * @param {string} formId - Form UUID
 * @returns {Promise<number>} - Next order index
 */
const getNextOrderIndex = async (formId) => {
    const query = `
        SELECT COALESCE(MAX(order_index), -1) + 1 as next_index
        FROM questions
        WHERE form_id = $1
    `;
    
    const result = await db.query(query, [formId]);
    return parseInt(result.rows[0].next_index);
};

/**
 * Reorder questions within a form
 * @param {string} formId - Form UUID
 * @param {Array<{id: string, order_index: number}>} orderings - New orderings
 * @returns {Promise<boolean>} - True if successful
 */
const reorderQuestions = async (formId, orderings) => {
    const client = await db.getClient();
    
    try {
        await client.query('BEGIN');
        
        for (const { id, order_index } of orderings) {
            await client.query(
                'UPDATE questions SET order_index = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND form_id = $3',
                [order_index, id, formId]
            );
        }
        
        await client.query('COMMIT');
        return true;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Check if question has any answers (for business constraints)
 * @param {string} questionId - Question UUID
 * @returns {Promise<boolean>} - True if question has answers
 */
const hasAnswers = async (questionId) => {
    const query = `
        SELECT EXISTS(
            SELECT 1 FROM answers 
            WHERE question_id = $1
        ) as has_answers
    `;
    
    const result = await db.query(query, [questionId]);
    return result.rows[0].has_answers;
};

/**
 * Get question count for a form
 * @param {string} formId - Form UUID
 * @returns {Promise<number>} - Number of questions
 */
const getCountByFormId = async (formId) => {
    const query = `
        SELECT COUNT(*) as count
        FROM questions
        WHERE form_id = $1
    `;
    
    const result = await db.query(query, [formId]);
    return parseInt(result.rows[0].count);
};

module.exports = {
    create,
    findById,
    findByFormId,
    update,
    remove,
    belongsToForm,
    getNextOrderIndex,
    reorderQuestions,
    hasAnswers,
    getCountByFormId,
    VALID_TYPES,
    TYPES_REQUIRING_OPTIONS
};
