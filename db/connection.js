import pg from 'pg';
const { Pool } = pg;

// Create connection pool with proper configuration
let pool = null;

try {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('DATABASE_URL not found in environment variables');
  } else {
    // Configure pool with SSL disabled for local development
    const options = { 
      connectionString
    };
    
    // Only add SSL options if not explicitly disabled in connection string
    if (!connectionString.includes('sslmode=disable')) {
      options.ssl = {
        rejectUnauthorized: false // Works for both development and production
      };
    }
    
    pool = new Pool(options);
    
    // Test connection immediately
    pool.query('SELECT 1')
      .then(() => {
        console.log('Database connection successful');
      })
      .catch(err => {
        console.error('Database connection failed during initialization:', err.message);
      });
  }
} catch (error) {
  console.error('Failed to create database connection pool:', error);
}

export default pool;
