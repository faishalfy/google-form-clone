/**
 * Submission Routes
 * 
 * LEVEL 3 FEATURE: Dedicated submission endpoints
 * 
 * Provides endpoints for:
 * - Listing all submissions for a form (form owner only)
 * - Getting detailed submission with answers (form owner only)
 * 
 * Routes: /api/forms/:formId/submissions/*
 * 
 * SECURITY:
 * - All endpoints require authentication
 * - Only form owner can access submission data
 * - Returns 403 for non-owners
 * 
 * SCALABILITY (10,000+ users):
 * - Pagination support
 * - Efficient database queries
 * - Proper indexing on form_id and submitted_at
 */

const express = require('express');
const router = express.Router({ mergeParams: true });

const submissionController = require('../controllers/submissionController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { submissionValidators } = require('../utils/validators');

/**
 * @swagger
 * /forms/{formId}/submissions:
 *   get:
 *     summary: List all submissions for a form
 *     description: |
 *       Returns a paginated list of submissions for the specified form.
 *       
 *       **Authorization**: Only the form owner can access this endpoint.
 *     tags: [Submissions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: formId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The form ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order by submission date
 *     responses:
 *       200:
 *         description: Submissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Submissions retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     submissions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Submission'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
    '/',
    authenticate,
    submissionValidators.list,
    validate,
    submissionController.listSubmissions
);

/**
 * @swagger
 * /forms/{formId}/submissions/{submissionId}:
 *   get:
 *     summary: Get detailed submission with all answers
 *     description: |
 *       Returns full submission details including:
 *       - Submission metadata (id, submitted_at, respondent)
 *       - All answers with question titles and types
 *       - Answer values
 *       
 *       **Authorization**: Only the form owner can access this endpoint.
 *       
 *       **Optimized Query**: Uses JOINs to fetch all data in a single query,
 *       avoiding N+1 query problems.
 *     tags: [Submissions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: formId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The form ID
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The submission ID
 *     responses:
 *       200:
 *         description: Submission details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Submission retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     submission:
 *                       $ref: '#/components/schemas/SubmissionDetail'
 *             example:
 *               success: true
 *               message: Submission retrieved successfully.
 *               data:
 *                 submission:
 *                   id: "550e8400-e29b-41d4-a716-446655440001"
 *                   form_id: "550e8400-e29b-41d4-a716-446655440000"
 *                   form_title: "Customer Feedback Survey"
 *                   submitted_at: "2026-02-28T10:30:00Z"
 *                   respondent:
 *                     id: "550e8400-e29b-41d4-a716-446655440002"
 *                     name: "Jane Smith"
 *                     email: "jane@example.com"
 *                   answers:
 *                     - question_id: "q1"
 *                       question_title: "How satisfied are you?"
 *                       question_type: "multiple_choice"
 *                       value: "Very satisfied"
 *                     - question_id: "q2"
 *                       question_title: "Any comments?"
 *                       question_type: "short_answer"
 *                       value: "Great service!"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
    '/:submissionId',
    authenticate,
    submissionValidators.getById,
    validate,
    submissionController.getSubmissionDetail
);

module.exports = router;
