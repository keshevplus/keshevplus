// add-phone-column.js - Add a phone column to the users table

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

async function addPhoneColumn() {
  try {
    // Get database URL
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('DATABASE_URL environment variable not found.');
      process.exit(1);
    }
    
    // Create SQL connection
    const sql = neon(databaseUrl);
    
    // Check if column exists
    const checkColumn = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'phone'
    `;
    
    if (checkColumn.length === 0) {
      // Add phone column
      console.log('Adding phone column to users table...');
      await sql`ALTER TABLE users ADD COLUMN phone VARCHAR(20)`;
      
      // Add a unique constraint
      console.log('Adding unique constraint on phone column...');
      await sql`ALTER TABLE users ADD CONSTRAINT users_phone_key UNIQUE (phone)`;
      
      console.log('Successfully added phone column to users table!');
    } else {
      console.log('phone column already exists in users table.');
    }
    
    // Show the updated schema
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;
    
    console.log('\nUsers table columns:');
    columns.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
addPhoneColumn();