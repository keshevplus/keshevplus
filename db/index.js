import pg from 'pg';
const { Pool } = pg;

// Ensure DATABASE_URL is set in your Vercel environment variables for the backend
// e.g., postgresql://neondb_owner:your_password@ep-icy-forest-a4rpjd22-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Error: DATABASE_URL environment variable is not set.');
  // Optionally, throw an error to prevent the application from starting without it in production
  // throw new Error('DATABASE_URL environment variable is not set.');
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false // For Neon, sslmode=require is often handled by the connection string,
                           // but this might be needed. For production, consider more secure SSL settings if required.
  }
});

export default pool;
