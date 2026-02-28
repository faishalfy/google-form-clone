/**
 * Form Service
 * 
 * Contains all business logic for form operations.
 * This layer sits between controllers and models.
 * 
 * Level 2 Updates:
 * - Added status field support
 * - Added filtering by status
 * - Added sorting options
 * - Added submission count tracking
 */

const formModel = require('../models/formModel');
const questionModel = require('../models/questionModel');
const { notFound, forbidden, badRequest, conflict } = require('../utils/apiResponse');

/**
 * Create a new form
 * @param {Object} formData - Form data
 * @param {string} userId - ID of the user creating the form
 * @returns {Promise<Object>} - Created form
 */
const createForm = async ({ title, description, status = 'draft' }, userId) => {
    // Validate status
    if (status && !formModel.VALID_STATUSES.includes(status)) {
        throw badRequest(`Invalid status. Must be one of: ${formModel.VALID_STATUSES.join(', ')}`);
    }
    
    const form = await formModel.create({
        title,
        description,
        status,
        user_id: userId
    });

    return form;
};

/**
 * Get form by ID
 * @param {string} formId - Form UUID
 * @param {string} userId - Current user ID (optional, for access control)
 * @returns {Promise<Object>} - Form object with questions
 */
const getFormById = async (formId, userId = null) => {
    const form = await formModel.findById(formId);

    if (!form) {
        throw notFound('Form not found.');
    }

    // If form is not published, only owner can view it
    if (form.status !== 'published' && userId !== form.user_id) {
        throw forbidden('You do not have permission to view this form.');
    }

    // Get questions for this form
    const questions = await questionModel.findByFormId(formId);
    
    // Get submission count
    const submissionCount = await formModel.getSubmissionCount(formId);

    return {
        id: form.id,
        title: form.title,
        description: form.description,
        status: form.status,
        is_published: form.is_published,
        created_at: form.created_at,
        updated_at: form.updated_at,
        submission_count: submissionCount,
        questions: questions,
        owner: {
            id: form.user_id,
            name: form.owner_name,
            email: form.owner_email
        }
    };
};

/**
 * Get all forms for a user (with pagination, filtering, and sorting)
 * @param {string} userId - User UUID
 * @param {Object} options - Query options
 * @param {string} options.search - Search term for title (partial match)
 * @param {string} options.status - Filter by status (draft, published, closed)
 * @param {string} options.sort - Sort order for created_at (asc, desc)
 * @returns {Promise<Object>} - Paginated forms
 */
const getUserForms = async (userId, options = {}) => {
    const { 
        page = 1, 
        limit = 10, 
        search = '', 
        status = '',
        sort = 'desc'
    } = options;

    // Validate pagination params
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    
    // Validate status if provided
    if (status && !formModel.VALID_STATUSES.includes(status)) {
        throw badRequest(`Invalid status filter. Must be one of: ${formModel.VALID_STATUSES.join(', ')}`);
    }
    
    // Validate sort order
    const sortOrder = formModel.VALID_SORT_ORDERS.includes(sort?.toLowerCase()) ? sort.toLowerCase() : 'desc';

    const result = await formModel.findByUserId(userId, {
        page: pageNum,
        limit: limitNum,
        search,
        status,
        sort: sortOrder
    });

    return {
        forms: result.forms,
        pagination: {
            currentPage: result.page,
            totalPages: result.totalPages,
            totalItems: result.total,
            itemsPerPage: result.limit,
            hasNextPage: result.page < result.totalPages,
            hasPrevPage: result.page > 1
        },
        filters: {
            search: search || null,
            status: status || null,
            sort: sortOrder
        }
    };
};

/**
 * Get all published forms (public access)
 * @param {Object} options - Pagination and filter options
 * @returns {Promise<Object>} - Paginated forms
 */
const getPublishedForms = async (options = {}) => {
    const { page = 1, limit = 10, search = '', sort = 'desc' } = options;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const sortOrder = formModel.VALID_SORT_ORDERS.includes(sort?.toLowerCase()) ? sort.toLowerCase() : 'desc';

    const result = await formModel.findPublished({
        page: pageNum,
        limit: limitNum,
        search,
        sort: sortOrder
    });

    return {
        forms: result.forms.map(form => ({
            id: form.id,
            title: form.title,
            description: form.description,
            status: form.status,
            created_at: form.created_at,
            owner_name: form.owner_name
        })),
        pagination: {
            currentPage: result.page,
            totalPages: result.totalPages,
            totalItems: result.total,
            itemsPerPage: result.limit,
            hasNextPage: result.page < result.totalPages,
            hasPrevPage: result.page > 1
        },
        filters: {
            search: search || null,
            sort: sortOrder
        }
    };
};

/**
 * Update form
 * @param {string} formId - Form UUID
 * @param {Object} updates - Fields to update
 * @param {string} userId - Current user ID (for authorization)
 * @returns {Promise<Object>} - Updated form
 */
const updateForm = async (formId, updates, userId) => {
    // Check if form exists
    const existingForm = await formModel.findById(formId);
    
    if (!existingForm) {
        throw notFound('Form not found.');
    }

    // Check if user owns the form
    if (existingForm.user_id !== userId) {
        throw forbidden('You do not have permission to update this form.');
    }

    // Filter out undefined values and only allow specific fields
    const allowedUpdates = {};
    if (updates.title !== undefined) allowedUpdates.title = updates.title;
    if (updates.description !== undefined) allowedUpdates.description = updates.description;
    
    // Handle status update
    if (updates.status !== undefined) {
        if (!formModel.VALID_STATUSES.includes(updates.status)) {
            throw badRequest(`Invalid status. Must be one of: ${formModel.VALID_STATUSES.join(', ')}`);
        }
        allowedUpdates.status = updates.status;
        // Sync is_published with status
        allowedUpdates.is_published = updates.status === 'published';
    }
    
    // Handle legacy is_published update
    if (updates.is_published !== undefined && updates.status === undefined) {
        allowedUpdates.is_published = updates.is_published;
        allowedUpdates.status = updates.is_published ? 'published' : 'draft';
    }

    // Update the form
    const updatedForm = await formModel.update(formId, allowedUpdates);

    return updatedForm;
};

/**
 * Delete form
 * @param {string} formId - Form UUID
 * @param {string} userId - Current user ID (for authorization)
 * @returns {Promise<boolean>} - True if deleted
 */
const deleteForm = async (formId, userId) => {
    // Check if form exists
    const existingForm = await formModel.findById(formId);
    
    if (!existingForm) {
        throw notFound('Form not found.');
    }

    // Check if user owns the form
    if (existingForm.user_id !== userId) {
        throw forbidden('You do not have permission to delete this form.');
    }

    // Delete the form (cascades to questions, responses, answers)
    await formModel.remove(formId);

    return true;
};

/**
 * Check if form has submissions
 * Used for business constraint validation
 * @param {string} formId - Form UUID
 * @returns {Promise<boolean>} - True if form has submissions
 */
const checkHasSubmissions = async (formId) => {
    return await formModel.hasSubmissions(formId);
};

/**
 * Verify form ownership
 * @param {string} formId - Form UUID
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} - Form if owned, throws error otherwise
 */
const verifyOwnership = async (formId, userId) => {
    const form = await formModel.findById(formId);
    
    if (!form) {
        throw notFound('Form not found.');
    }
    
    if (form.user_id !== userId) {
        throw forbidden('You do not have permission to access this form.');
    }
    
    return form;
};

/**
 * Get form for submission (public access to published forms)
 * @param {string} formId - Form UUID
 * @returns {Promise<Object>} - Form with questions
 */
const getFormForSubmission = async (formId) => {
    const form = await formModel.findById(formId);

    if (!form) {
        throw notFound('Form not found.');
    }

    // Only published forms can accept submissions
    if (form.status !== 'published') {
        throw forbidden('This form is not accepting responses.');
    }

    // Get questions for this form
    const questions = await questionModel.findByFormId(formId);

    return {
        id: form.id,
        title: form.title,
        description: form.description,
        questions: questions.map(q => ({
            id: q.id,
            title: q.title,
            type: q.type,
            options: q.options,
            is_required: q.is_required,
            order_index: q.order_index
        }))
    };
};

module.exports = {
    createForm,
    getFormById,
    getUserForms,
    getPublishedForms,
    updateForm,
    deleteForm,
    checkHasSubmissions,
    verifyOwnership,
    getFormForSubmission
};
