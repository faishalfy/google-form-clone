/**
 * Express Application Setup
 * 
 * This file configures the Express application with all middlewares,
 * routes, and error handlers.
 * 
 * Level 3 Updates:
 * - Added Swagger/OpenAPI documentation at /api-docs
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import routes
const routes = require('./routes');

// Import error handling middleware
const { errorHandler, notFoundHandler } = require('./middlewares/errorMiddleware');

// Import Swagger configuration (Level 3)
const { setupSwagger } = require('./config/swagger');

// Create Express application
const app = express();

// ===========================================
// Security Middlewares
// ===========================================

// Helmet: Adds various HTTP headers for security
app.use(helmet());

// CORS: Enable Cross-Origin Resource Sharing
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting: Prevent brute-force attacks
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: '15 minutes'
        }
    },
    standardHeaders: true,
    legacyHeaders: false
});

app.use(limiter);

// ===========================================
// Body Parsing Middlewares
// ===========================================

// Parse JSON bodies (limit size to prevent large payload attacks)
app.use(express.json({ limit: '10kb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ===========================================
// Logging Middleware
// ===========================================

// Morgan: HTTP request logger
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// ===========================================
// Health Check Endpoint
// ===========================================

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ===========================================
// API Documentation (Level 3)
// ===========================================

// Setup Swagger UI at /api-docs
setupSwagger(app);

// ===========================================
// API Routes
// ===========================================

// Mount all routes under /api prefix
app.use('/api', routes);

// ===========================================
// Error Handling
// ===========================================

// Handle 404 - Route not found
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
