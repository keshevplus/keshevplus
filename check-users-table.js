// check-users-table.js - Simple script to check users table structure

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

// Database connection
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL environment variable not found.');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function checkUsersTable() {
  try {
    console.log('Checking users table structure...');
    
    // Get table columns
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `;
    
    console.log('Users table columns:');
    tableInfo.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type}, ${col.is_nullable === 'YES' ? 'nullable' : 'not nullable'})`);
    });
    
  } catch (error) {
    console.error('Error checking users table:', error);
  }
}

// Run the check function
checkUsersTable();
