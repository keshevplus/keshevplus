// add-user-id-to-leads.js - Add user_id column to leads table

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

async function addUserIdColumn() {
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
      WHERE table_name = 'leads' AND column_name = 'user_id'
    `;
    
    if (checkColumn.length === 0) {
      // Add user_id column
      console.log('Adding user_id column to leads table...');
      await sql`ALTER TABLE leads ADD COLUMN user_id INTEGER`;
      
      // Add foreign key constraint
      console.log('Adding foreign key constraint...');
      await sql`
        ALTER TABLE leads ADD CONSTRAINT fk_leads_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      `;
      
      // Create index
      console.log('Creating index on user_id...');
      await sql`CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id)`;
      
      console.log('Successfully added user_id column to leads table!');
    } else {
      console.log('user_id column already exists in leads table.');
    }
    
    // Show the updated schema
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'leads'
      ORDER BY ordinal_position
    `;
    
    console.log('\nLeads table columns:');
    columns.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
addUserIdColumn();
