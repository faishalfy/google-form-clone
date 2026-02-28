/**
 * Database Configuration
 * 
 * This file handles PostgreSQL database connection using the 'pg' library.
 * It creates a connection pool for efficient database operations.
 */

const { Pool } = require('pg');

/**
 * PostgreSQL Connection Pool
 * 
 * A pool manages multiple connections and reuses them,
 * which is more efficient than creating a new connection for each query.
 */
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'google_form_clone',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    
    // Pool configuration for scalability
    max: 20,                    // Maximum number of connections in the pool
    idleTimeoutMillis: 30000,   // Close idle connections after 30 seconds
    connectionTimeoutMillis: 2000 // Return an error after 2 seconds if connection could not be established
});

/**
 * Test database connection
 * @returns {Promise<boolean>} - Returns true if connection is successful
 */
const testConnection = async () => {
    const client = await pool.connect();
    try {
        await client.query('SELECT NOW()');
        return true;
    } finally {
        client.release();
    }
};

/**
 * Execute a query with parameters
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} - Query result
 */
const query = async (text, params) => {
    const start = Date.now();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries in development
    if (process.env.NODE_ENV === 'development' && duration > 100) {
        console.log('Slow query:', { text, duration: `${duration}ms`, rows: result.rowCount });
    }
    
    return result;
};

/**
 * Get a client from the pool for transactions
 * @returns {Promise<Object>} - Database client
 */
const getClient = async () => {
    return await pool.connect();
};

module.exports = {
    pool,
    query,
    getClient,
    testConnection
};
