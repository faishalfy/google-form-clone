/**
 * Form Controller
 * 
 * Handles HTTP requests for form endpoints.
 * Controllers are thin - they delegate business logic to services.
 * 
 * Level 2 Updates:
 * - Added status filter support
 * - Added sort order support
 * - Form responses now include questions
 */

const formService = require('../services/formService');
const { successResponse } = require('../utils/apiResponse');

/**
 * Create a new form
 * POST /api/forms
 * Protected route - requires authentication
 */
const createForm = async (req, res, next) => {
    try {
        const { title, description, status } = req.body;
        const userId = req.user.id;
        
        const form = await formService.createForm({ title, description, status }, userId);
        
        return successResponse(
            res,
            201,
            'Form created successfully.',
            { form }
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get all forms for the authenticated user
 * GET /api/forms
 * Supports: ?search=term&status=draft|published|closed&sort=asc|desc&page=1&limit=10
 * Protected route - requires authentication
 */
const getUserForms = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { page, limit, search, status, sort } = req.query;
        
        const result = await formService.getUserForms(userId, { 
            page, 
            limit, 
            search,
            status,
            sort 
        });
        
        return successResponse(
            res,
            200,
            'Forms retrieved successfully.',
            { forms: result.forms },
            { 
                pagination: result.pagination,
                filters: result.filters
            }
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get all published forms (public access)
 * GET /api/forms/public
 * Supports: ?search=term&sort=asc|desc&page=1&limit=10
 * Public route - no authentication required
 */
const getPublishedForms = async (req, res, next) => {
    try {
        const { page, limit, search, sort } = req.query;
        
        const result = await formService.getPublishedForms({ page, limit, search, sort });
        
        return successResponse(
            res,
            200,
            'Published forms retrieved successfully.',
            { forms: result.forms },
            { 
                pagination: result.pagination,
                filters: result.filters
            }
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get form by ID
 * GET /api/forms/:id
 * Public route (but unpublished forms require ownership)
 */
const getFormById = async (req, res, next) => {
    try {
        const { id } = req.params;
        // req.user may be null if not authenticated (using optionalAuth)
        const userId = req.user ? req.user.id : null;
        
        const form = await formService.getFormById(id, userId);
        
        return successResponse(
            res,
            200,
            'Form retrieved successfully.',
            { form }
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Update form
 * PUT /api/forms/:id
 * Protected route - requires authentication and ownership
 */
const updateForm = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, status, is_published } = req.body;
        const userId = req.user.id;
        
        const form = await formService.updateForm(
            id,
            { title, description, status, is_published },
            userId
        );
        
        return successResponse(
            res,
            200,
            'Form updated successfully.',
            { form }
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Delete form
 * DELETE /api/forms/:id
 * Protected route - requires authentication and ownership
 */
const deleteForm = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        await formService.deleteForm(id, userId);
        
        return successResponse(
            res,
            200,
            'Form deleted successfully.',
            null
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createForm,
    getUserForms,
    getPublishedForms,
    getFormById,
    updateForm,
    deleteForm
};
