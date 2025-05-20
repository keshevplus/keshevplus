// run-sql-script.js - Execute the SQL script using the neon database connector

import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSqlScript(scriptName) {
  try {
    // Get database URL
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('DATABASE_URL environment variable not found.');
      process.exit(1);
    }
    
    // Create SQL connection
    const sql = neon(databaseUrl);
    
    // Read the SQL script
    const scriptPath = path.join(__dirname, scriptName);
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    
    // Split the script into statements (simplified approach)
    const statements = scriptContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      try {
        // Skip DO blocks as they need special handling
        if (statements[i].toUpperCase().startsWith('DO')) {
          console.log(`Executing PL/pgSQL DO block #${i+1}...`);
          await sql.raw(statements[i]);
          console.log('DO block executed successfully');
        } 
        // Skip SELECT statements which are just for checking
        else if (statements[i].toUpperCase().startsWith('SELECT')) {
          console.log(`Skipping SELECT statement #${i+1} (informational only)`);
        }
        else if (statements[i].length > 10) {
          console.log(`Executing statement #${i+1}...`);
          await sql.raw(statements[i]);
          console.log('Statement executed successfully');
        }
      } catch (err) {
        console.error(`Error executing statement #${i+1}:`, err.message);
        console.log('Statement:', statements[i]);
      }
    }
    
    console.log('SQL script execution completed');
    
    // Now let's check if the columns were added
    const messagesColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'messages'
      ORDER BY ordinal_position
    `;
    
    console.log('\nMessages table columns:');
    messagesColumns.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type})`);
    });
    
    const leadsColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'leads'
      ORDER BY ordinal_position
    `;
    
    console.log('\nLeads table columns:');
    leadsColumns.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type})`);
    });
    
  } catch (error) {
    console.error('Script execution error:', error);
  }
}

// Execute the script
const scriptName = process.argv[2] || 'add_user_id_column.sql';
console.log(`Executing SQL script: ${scriptName}`);
runSqlScript(scriptName);
