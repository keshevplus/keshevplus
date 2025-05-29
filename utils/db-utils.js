import pool from '../services/database.js';

/**
 * Execute a database query with proper error handling
 * @param {string} queryText - The SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} - Query result
 */
export const executeQuery = async (queryText, params = []) => {
  try {
    const result = await pool.query(queryText, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error(`Database query failed: ${error.message}`);
  }
};

/**
 * Execute a transaction with multiple queries
 * @param {Function} callback - Function that receives a client and executes queries
 * @returns {Promise<*>} - Result from the callback
 */
export const executeTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', error);
    throw new Error(`Transaction failed: ${error.message}`);
  } finally {
    client.release();
  }
};

export default {
  executeQuery,
  executeTransaction
};
