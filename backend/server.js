/**
 * Server Entry Point
 * 
 * This file is the main entry point of the application.
 * It loads environment variables and starts the Express server.
 */

// Load environment variables FIRST (before anything else)
require('dotenv').config();

const app = require('./src/app');
const db = require('./src/config/database');

// Get port from environment variables or use default
const PORT = process.env.PORT || 5000;

/**
 * Initialize and start the server
 */
const startServer = async () => {
    try {
        // Test database connection
        await db.testConnection();
        console.log('✅ Database connected successfully');

        // Start the Express server
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
            console.log('-------------------------------------------');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // In production, you might want to gracefully shutdown
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Start the server
startServer();
