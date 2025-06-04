import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Create a connection pool with retry logic
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Add connection timeouts and limits
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 10000, // Attempt to connect for 10 seconds
  max: 10, // Maximum 10 clients in the pool
});

// Add event listeners for connection issues
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle database client', err);
  // Don't crash the application on connection errors
});

// Add a method to test the connection
pool.testConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('Database connection verified successfully:', result.rows[0].now);
    return true;
  } catch (err) {
    console.error('Error testing database connection:', err);
    return false;
  } finally {
    if (client) client.release();
  }
};

// Execute the test connection immediately
pool.testConnection()
  .then(connected => {
    if (connected) {
      console.log('Connected to Neon database successfully');
    } else {
      console.error('Failed to connect to Neon database');
    }
  });

export default pool;
