import dotenv from 'dotenv';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Database connection
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('No database URL found in environment variables. Please check your .env file.');
  process.exit(1);
}

const sql = neon(databaseUrl + '?sslmode=require');

async function copyMessagesToLeads() {
  try {
    console.log('Starting copy process from messages to leads table...');
    console.log('Using database URL:', databaseUrl.substring(0, databaseUrl.indexOf('@')) + '****' + databaseUrl.substring(databaseUrl.lastIndexOf('/')));
    
    // 1. Check if messages table exists
    try {
      console.log('Checking if messages table exists...');
      const messagesExists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'messages'
        );
      `;
      
      if (!messagesExists[0].exists) {
        console.error('Messages table does not exist!');
        return;
      }
      
      console.log('Messages table exists.');
    } catch (error) {
      console.error('Error checking messages table:', error);
      return;
    }
    
    // 2. Get all records from messages table
    console.log('Fetching records from messages table...');
    const messages = await sql`
      SELECT id, name, email, phone, subject, message, date_received 
      FROM messages 
      ORDER BY date_received
    `;
    
    console.log(`Found ${messages.length} records in messages table.`);
    
    if (messages.length === 0) {
      console.log('No records found in messages table. Nothing to copy.');
      return;
    }
    
    // 3. Check if leads table exists, create if not
    try {
      console.log('Checking/creating leads table...');
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
    
    // 4. Copy each record from messages to leads
    console.log('Copying records to leads table...');
    let successCount = 0;
    let errorCount = 0;
    
    for (const message of messages) {
      try {
        // Check if this message already exists in leads by matching name, email, and message
        const exists = await sql`
          SELECT EXISTS (
            SELECT 1 FROM leads 
            WHERE name = ${message.name} 
            AND email = ${message.email} 
            AND message = ${message.message}
          )
        `;
        
        if (exists[0].exists) {
          console.log(`⚠️ Message ID ${message.id} appears to already exist in leads table.`);
          continue;
        }
        
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
          RETURNING id
        `;
        
        if (result && result.length > 0) {
          console.log(`✅ Copied message ID ${message.id} to lead ID ${result[0].id}`);
          successCount++;
        }
      } catch (error) {
        console.error(`❌ Error copying message ID ${message.id}:`, error);
        errorCount++;
      }
    }
    
    console.log('\nCopy process completed:');
    console.log(`✅ Successfully copied: ${successCount} records`);
    console.log(`⚠️ Already existed/skipped: ${messages.length - successCount - errorCount} records`);
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
