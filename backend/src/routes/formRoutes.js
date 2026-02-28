/**
 * Form Routes
 * 
 * Defines all routes for form CRUD operations.
 * Routes: /api/forms/*
 * 
 * Level 2 Updates:
 * - Added status filter support
 * - Added sort order support
 * 
 * Level 3 Updates:
 * - Added Swagger/OpenAPI documentation
 */

const express = require('express');
const router = express.Router();

const formController = require('../controllers/formController');
const { authenticate, optionalAuth } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { formValidators } = require('../utils/validators');

/**
 * @swagger
 * /api/forms/public:
 *   get:
 *     summary: Get all published forms
 *     description: Returns a paginated list of publicly available forms
 *     tags: [Forms]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search forms by title
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort by creation date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Forms retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     forms:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Form'
 *                 meta:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get(
    '/public',
    formValidators.list,
    validate,
    formController.getPublishedForms
);

/**
 * @swagger
 * /api/forms:
 *   post:
 *     summary: Create a new form
 *     description: Creates a new form with the provided title and optional description
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFormRequest'
 *     responses:
 *       201:
 *         description: Form created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     form:
 *                       $ref: '#/components/schemas/Form'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
    '/',
    authenticate,
    formValidators.create,
    validate,
    formController.createForm
);

/**
 * @swagger
 * /api/forms:
 *   get:
 *     summary: Get all forms for current user
 *     description: Returns a paginated list of forms owned by the authenticated user
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search forms by title
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, closed]
 *         description: Filter by form status
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort by creation date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Forms retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
    '/',
    authenticate,
    formValidators.list,
    validate,
    formController.getUserForms
);

/**
 * @swagger
 * /api/forms/{id}:
 *   get:
 *     summary: Get form by ID
 *     description: |
 *       Returns form details. Published forms are publicly accessible.
 *       Draft/closed forms require authentication and ownership.
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Form ID
 *     responses:
 *       200:
 *         description: Form retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     form:
 *                       $ref: '#/components/schemas/Form'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
    '/:id',
    optionalAuth,
    formValidators.getById,
    validate,
    formController.getFormById
);

/**
 * @swagger
 * /api/forms/{id}:
 *   put:
 *     summary: Update form by ID
 *     description: Updates form title, description, or status. Requires ownership.
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Form ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateFormRequest'
 *     responses:
 *       200:
 *         description: Form updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put(
    '/:id',
    authenticate,
    formValidators.update,
    validate,
    formController.updateForm
);

/**
 * @swagger
 * /api/forms/{id}:
 *   delete:
 *     summary: Delete form by ID
 *     description: Permanently deletes a form and all its questions/responses. Requires ownership.
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Form ID
 *     responses:
 *       200:
 *         description: Form deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete(
    '/:id',
    authenticate,
    formValidators.delete,
    validate,
    formController.deleteForm
);

module.exports = router;
