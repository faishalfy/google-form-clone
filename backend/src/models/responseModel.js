/**
 * Response Model
 * 
 * Handles all database operations related to form responses and answers.
 * Responses represent a single submission of a form.
 * Answers are individual answers to questions within a response.
 */

const db = require('../config/database');

/**
 * Create a new response with answers (using transaction)
 * @param {Object} responseData - Response data
 * @param {string} responseData.form_id - Form UUID
 * @param {string} responseData.user_id - User UUID (optional, can be null for anonymous)
 * @param {Array} responseData.answers - Array of answer objects
 * @returns {Promise<Object>} - Created response with answers
 */
const createWithAnswers = async ({ form_id, user_id = null, answers }) => {
    const client = await db.getClient();
    
    try {
        await client.query('BEGIN');
        
        // Create the response
        const responseQuery = `
            INSERT INTO responses (form_id, user_id)
            VALUES ($1, $2)
            RETURNING id, form_id, user_id, submitted_at
        `;
        
        const responseResult = await client.query(responseQuery, [form_id, user_id]);
        const response = responseResult.rows[0];
        
        // Create answers
        const createdAnswers = [];
        
        for (const answer of answers) {
            const answerQuery = `
                INSERT INTO answers (response_id, question_id, value)
                VALUES ($1, $2, $3)
                RETURNING id, response_id, question_id, value, created_at
            `;
            
            // Store value as JSONB
            const valueJson = JSON.stringify(answer.value);
            
            const answerResult = await client.query(answerQuery, [
                response.id,
                answer.question_id,
                valueJson
            ]);
            
            createdAnswers.push(answerResult.rows[0]);
        }
        
        await client.query('COMMIT');
        
        return {
            ...response,
            answers: createdAnswers
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Find response by ID
 * @param {string} id - Response UUID
 * @returns {Promise<Object|null>} - Response object with answers or null
 */
const findById = async (id) => {
    const responseQuery = `
        SELECT 
            r.id, 
            r.form_id, 
            r.user_id,
            r.submitted_at,
            u.name as respondent_name,
            u.email as respondent_email
        FROM responses r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.id = $1
    `;
    
    const responseResult = await db.query(responseQuery, [id]);
    
    if (responseResult.rows.length === 0) {
        return null;
    }
    
    const response = responseResult.rows[0];
    
    // Get answers for this response
    const answersQuery = `
        SELECT 
            a.id,
            a.question_id,
            a.value,
            a.created_at,
            q.title as question_title,
            q.type as question_type
        FROM answers a
        JOIN questions q ON a.question_id = q.id
        WHERE a.response_id = $1
        ORDER BY q.order_index ASC
    `;
    
    const answersResult = await db.query(answersQuery, [id]);
    
    return {
        ...response,
        answers: answersResult.rows
    };
};

/**
 * Find all responses for a form with pagination
 * @param {string} formId - Form UUID
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (1-based)
 * @param {number} options.limit - Items per page
 * @param {string} options.sort - Sort order for submitted_at (asc, desc)
 * @returns {Promise<Object>} - { responses, total, page, limit, totalPages }
 */
const findByFormId = async (formId, { page = 1, limit = 10, sort = 'desc' } = {}) => {
    const offset = (page - 1) * limit;
    const sortOrder = sort.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    
    // Get total count
    const countQuery = `
        SELECT COUNT(*) as total
        FROM responses
        WHERE form_id = $1
    `;
    const countResult = await db.query(countQuery, [formId]);
    const total = parseInt(countResult.rows[0].total);
    
    // Get paginated responses
    const responsesQuery = `
        SELECT 
            r.id, 
            r.form_id, 
            r.user_id,
            r.submitted_at,
            u.name as respondent_name,
            u.email as respondent_email
        FROM responses r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.form_id = $1
        ORDER BY r.submitted_at ${sortOrder}
        LIMIT $2 OFFSET $3
    `;
    
    const responsesResult = await db.query(responsesQuery, [formId, limit, offset]);
    
    return {
        responses: responsesResult.rows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};

/**
 * Find all responses for a form with answers (for export)
 * @param {string} formId - Form UUID
 * @returns {Promise<Array>} - Array of responses with answers
 */
const findByFormIdWithAnswers = async (formId) => {
    // Get all responses
    const responsesQuery = `
        SELECT 
            r.id, 
            r.form_id, 
            r.user_id,
            r.submitted_at,
            u.name as respondent_name,
            u.email as respondent_email
        FROM responses r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.form_id = $1
        ORDER BY r.submitted_at DESC
    `;
    
    const responsesResult = await db.query(responsesQuery, [formId]);
    
    // Get all answers for these responses
    const responseIds = responsesResult.rows.map(r => r.id);
    
    if (responseIds.length === 0) {
        return [];
    }
    
    const answersQuery = `
        SELECT 
            a.id,
            a.response_id,
            a.question_id,
            a.value,
            a.created_at,
            q.title as question_title,
            q.type as question_type,
            q.order_index
        FROM answers a
        JOIN questions q ON a.question_id = q.id
        WHERE a.response_id = ANY($1)
        ORDER BY q.order_index ASC
    `;
    
    const answersResult = await db.query(answersQuery, [responseIds]);
    
    // Group answers by response_id
    const answersByResponse = {};
    for (const answer of answersResult.rows) {
        if (!answersByResponse[answer.response_id]) {
            answersByResponse[answer.response_id] = [];
        }
        answersByResponse[answer.response_id].push(answer);
    }
    
    // Combine responses with their answers
    return responsesResult.rows.map(response => ({
        ...response,
        answers: answersByResponse[response.id] || []
    }));
};

/**
 * Find responses by user ID
 * @param {string} userId - User UUID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Paginated responses
 */
const findByUserId = async (userId, { page = 1, limit = 10 } = {}) => {
    const offset = (page - 1) * limit;
    
    // Get total count
    const countQuery = `
        SELECT COUNT(*) as total
        FROM responses
        WHERE user_id = $1
    `;
    const countResult = await db.query(countQuery, [userId]);
    const total = parseInt(countResult.rows[0].total);
    
    // Get paginated responses
    const responsesQuery = `
        SELECT 
            r.id, 
            r.form_id, 
            r.user_id,
            r.submitted_at,
            f.title as form_title
        FROM responses r
        JOIN forms f ON r.form_id = f.id
        WHERE r.user_id = $1
        ORDER BY r.submitted_at DESC
        LIMIT $2 OFFSET $3
    `;
    
    const responsesResult = await db.query(responsesQuery, [userId, limit, offset]);
    
    return {
        responses: responsesResult.rows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};

/**
 * Delete response
 * @param {string} id - Response UUID
 * @returns {Promise<boolean>} - True if deleted
 */
const remove = async (id) => {
    const query = `
        DELETE FROM responses
        WHERE id = $1
        RETURNING id
    `;
    
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
};

/**
 * Get response count for a form
 * @param {string} formId - Form UUID
 * @returns {Promise<number>} - Number of responses
 */
const getCountByFormId = async (formId) => {
    const query = `
        SELECT COUNT(*) as count
        FROM responses
        WHERE form_id = $1
    `;
    
    const result = await db.query(query, [formId]);
    return parseInt(result.rows[0].count);
};

/**
 * Check if user has already submitted a response to a form
 * @param {string} formId - Form UUID
 * @param {string} userId - User UUID
 * @returns {Promise<boolean>} - True if user has already submitted
 */
const hasUserSubmitted = async (formId, userId) => {
    if (!userId) return false;
    
    const query = `
        SELECT EXISTS(
            SELECT 1 FROM responses 
            WHERE form_id = $1 AND user_id = $2
        ) as has_submitted
    `;
    
    const result = await db.query(query, [formId, userId]);
    return result.rows[0].has_submitted;
};

/**
 * Get answer statistics for a question (useful for analytics)
 * @param {string} questionId - Question UUID
 * @returns {Promise<Object>} - Answer statistics
 */
const getAnswerStatistics = async (questionId) => {
    const query = `
        SELECT 
            value,
            COUNT(*) as count
        FROM answers
        WHERE question_id = $1
        GROUP BY value
        ORDER BY count DESC
    `;
    
    const result = await db.query(query, [questionId]);
    
    const totalResponses = result.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
    
    return {
        question_id: questionId,
        total_responses: totalResponses,
        distribution: result.rows.map(row => ({
            value: row.value,
            count: parseInt(row.count),
            percentage: totalResponses > 0 ? ((parseInt(row.count) / totalResponses) * 100).toFixed(2) : 0
        }))
    };
};

module.exports = {
    createWithAnswers,
    findById,
    findByFormId,
    findByFormIdWithAnswers,
    findByUserId,
    remove,
    getCountByFormId,
    hasUserSubmitted,
    getAnswerStatistics
};
