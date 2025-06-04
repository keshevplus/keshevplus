const { Pool } = require('pg');
const { logger } = require('../utils/logger'); // Adjust path if needed

// Connection configuration 
const pool = new Pool({
  // Get config from environment variables
  connectionString: process.env.DATABASE_URL,
  // Add connection timeout
  connectionTimeoutMillis: 10000,
  // Add idle timeout
  idleTimeoutMillis: 30000,
  // Maximum number of clients the pool should contain
  max: 20,
});

// Add event listeners to handle connection issues
pool.on('error', (err, client) => {
  logger.error('Unexpected error on idle client', err);
});

// Wrapper function with retry logic
async function query(text, params, retries = 5) {
  let lastError = null;
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(text, params);
        return result;
      } finally {
        client.release();
      }
    } catch (err) {
      lastError = err;
      logger.error(`Database query failed (attempt ${i+1}/${retries})`, err.message);
      // Wait before retrying
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
  }
  throw lastError;
}

// Health check function
async function checkConnection() {
  try {
    await query('SELECT NOW()');
    logger.info(`Database connection verified successfully: ${new Date().toISOString()}`);
    return true;
  } catch (err) {
    logger.error('Database connection failed:', err.message);
    return false;
  }
}

module.exports = {
  query,
  pool,
  checkConnection
};
