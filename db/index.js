import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

// Add debug information to help diagnose deployment issues
console.log('[DB] Module initialization - Import path:', import.meta.url);
console.log('[DB] Current working directory:', process.cwd());
console.log('[DB] Environment:', process.env.NODE_ENV);

// Ensure DATABASE_URL is set in your Vercel environment variables for the backend
// e.g., postgresql://neondb_owner:your_password@ep-icy-forest-a4rpjd22-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('[DB] Error: DATABASE_URL environment variable is not set.');
  // In production, log more details but don't crash the app
  console.error('[DB] Available env vars:', Object.keys(process.env).join(', '));
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
