import dotenv from 'dotenv';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { query } from '../config/db.js';
import { neon } from '@neondatabase/serverless';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Database connections
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('No database URL found in environment variables. Please check your .env file.');
  process.exit(1);
}

const sql = neon(databaseUrl + '?sslmode=require');

async function copyMessagesToLeads() {
  try {
    console.log('Starting copy process from messages to leads table...');
    
    // 1. Get all records from messages table
    console.log('Fetching records from messages table...');
    const messages = await query('SELECT id, name, email, phone, subject, message, date_received FROM messages ORDER BY date_received');
    console.log(`Found ${messages.rows.length} records in messages table.`);
    
    if (messages.rows.length === 0) {
      console.log('No records found in messages table. Nothing to copy.');
      return;
    }
    
    // 2. Check if leads table exists, create if not
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS leads (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          phone VARCHAR(20) NOT NULL,
          subject VARCHAR(255),
          message TEXT NOT NULL,
          date_received TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      console.log('Leads table checked/created.');
    } catch (error) {
      console.error('Error creating leads table:', error);
      return;
    }
    
    // 3. Copy each record from messages to leads
    console.log('Copying records to leads table...');
    let successCount = 0;
    let errorCount = 0;
    
    for (const message of messages.rows) {
      try {
        const result = await sql`
          INSERT INTO leads (name, email, phone, subject, message, date_received)
          VALUES (
            ${message.name},
            ${message.email},
            ${message.phone},
            ${message.subject},
            ${message.message},
            ${message.date_received}
          )
          ON CONFLICT DO NOTHING
          RETURNING id
        `;
        
        if (result && result.length > 0) {
          console.log(`✅ Copied message ID ${message.id} to lead ID ${result[0].id}`);
          successCount++;
        } else {
          console.log(`⚠️ Message ID ${message.id} already exists in leads table.`);
        }
      } catch (error) {
        console.error(`❌ Error copying message ID ${message.id}:`, error);
        errorCount++;
      }
    }
    
    console.log('\nCopy process completed:');
    console.log(`✅ Successfully copied: ${successCount} records`);
    console.log(`⚠️ Already existed/skipped: ${messages.rows.length - successCount - errorCount} records`);
    console.log(`❌ Failed to copy: ${errorCount} records`);
    
  } catch (error) {
    console.error('Unexpected error during copy process:', error);
  }
}

// Execute the function
copyMessagesToLeads()
  .then(() => {
    console.log('Script execution completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });
