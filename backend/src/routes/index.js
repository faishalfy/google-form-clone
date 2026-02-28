/**
 * Main Router
 * 
 * Aggregates all route modules and exports a single router.
 * This keeps app.js clean and routes organized.
 * 
 * Level 2 Updates:
 * - Added question routes (nested under forms)
 * - Added response routes (nested under forms)
 * - Added user responses route
 * 
 * Level 3 Updates:
 * - Added submission routes for form owners
 */

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const formRoutes = require('./formRoutes');
const questionRoutes = require('./questionRoutes');
const responseRoutes = require('./responseRoutes');
const submissionRoutes = require('./submissionRoutes');
const responseController = require('../controllers/responseController');
const { authenticate } = require('../middlewares/authMiddleware');

/**
 * API Welcome Route
 * GET /api
 */
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Google Form Clone API',
        version: '2.0.0',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                profile: 'GET /api/auth/me'
            },
            forms: {
                create: 'POST /api/forms',
                list: 'GET /api/forms',
                listWithFilters: 'GET /api/forms?search=term&status=draft|published|closed&sort=asc|desc',
                public: 'GET /api/forms/public',
                get: 'GET /api/forms/:id',
                update: 'PUT /api/forms/:id',
                delete: 'DELETE /api/forms/:id'
            },
            questions: {
                create: 'POST /api/forms/:formId/questions',
                list: 'GET /api/forms/:formId/questions',
                get: 'GET /api/forms/:formId/questions/:id',
                update: 'PUT /api/forms/:formId/questions/:id',
                delete: 'DELETE /api/forms/:formId/questions/:id',
                reorder: 'PUT /api/forms/:formId/questions/reorder'
            },
            responses: {
                submit: 'POST /api/forms/:formId/submit',
                list: 'GET /api/forms/:formId/responses',
                get: 'GET /api/forms/:formId/responses/:id',
                delete: 'DELETE /api/forms/:formId/responses/:id',
                export: 'GET /api/forms/:formId/responses/export',
                statistics: 'GET /api/forms/:formId/questions/:questionId/statistics',
                myResponses: 'GET /api/responses/me'
            },
            submissions: {
                note: 'Level 3 Feature - Form owner access to submissions',
                list: 'GET /api/forms/:formId/submissions',
                detail: 'GET /api/forms/:formId/submissions/:submissionId'
            }
        },
        businessConstraints: {
            note: 'Forms with submissions have restrictions',
            rules: [
                'Cannot delete questions if form has submissions',
                'Cannot change question type if form has submissions',
                'Cannot remove existing options for choice questions with submissions'
            ]
        },
        documentation: 'See README.md for detailed documentation'
    });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/forms', formRoutes);

// Nested routes for questions (under forms)
router.use('/forms/:formId/questions', questionRoutes);

// Nested routes for responses (under forms)
router.use('/forms/:formId', responseRoutes);

// Nested routes for submissions (Level 3 - under forms)
router.use('/forms/:formId/submissions', submissionRoutes);

// User's own responses route
router.get('/responses/me', authenticate, responseController.getMyResponses);

module.exports = router;
