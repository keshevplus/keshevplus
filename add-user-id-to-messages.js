// add-user-id-to-messages.js - Add user_id column to messages table

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
      WHERE table_name = 'messages' AND column_name = 'user_id'
    `;
    
    if (checkColumn.length === 0) {
      // Add user_id column
      console.log('Adding user_id column to messages table...');
      await sql`ALTER TABLE messages ADD COLUMN user_id INTEGER`;
      
      // Add foreign key constraint
      console.log('Adding foreign key constraint...');
      await sql`
        ALTER TABLE messages ADD CONSTRAINT fk_messages_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      `;
      
      // Create index
      console.log('Creating index on user_id...');
      await sql`CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id)`;
      
      console.log('Successfully added user_id column to messages table!');
    } else {
      console.log('user_id column already exists in messages table.');
    }
    
    // Show the updated schema
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'messages'
      ORDER BY ordinal_position
    `;
    
    console.log('\nMessages table columns:');
    columns.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
addUserIdColumn();
