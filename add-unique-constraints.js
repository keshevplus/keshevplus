// add-unique-constraints.js - Add unique constraints to users table

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

async function addUniqueConstraints() {
  try {
    // Get database URL
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('DATABASE_URL environment variable not found.');
      process.exit(1);
    }
    
    // Create SQL connection
    const sql = neon(databaseUrl);
    
    console.log('Checking for duplicate email addresses...');
    const duplicateEmails = await sql`
      SELECT email, COUNT(*) 
      FROM users 
      WHERE email IS NOT NULL 
      GROUP BY email 
      HAVING COUNT(*) > 1
    `;
    
    if (duplicateEmails.length > 0) {
      console.log('Warning: Found duplicate email addresses:');
      duplicateEmails.forEach(dup => {
        console.log(`- ${dup.email}: ${dup.count} occurrences`);
      });
      console.log('Please fix duplicate emails before adding the unique constraint.');
    } else {
      console.log('No duplicate emails found, proceeding...');
      
      // Check if the constraint already exists
      const emailConstraintExists = await sql`
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_email_key' AND conrelid = 'users'::regclass
      `;
      
      if (emailConstraintExists.length === 0) {
        // Clean up empty email values
        await sql`UPDATE users SET email = NULL WHERE email = ''`;
        
        // Add the constraint
        console.log('Adding unique constraint for email...');
        await sql`ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email)`;
        console.log('Unique constraint for email added successfully!');
      } else {
        console.log('Email unique constraint already exists');
      }
    }
    
    console.log('\nChecking for duplicate phone numbers...');
    const duplicatePhones = await sql`
      SELECT phone, COUNT(*) 
      FROM users 
      WHERE phone IS NOT NULL 
      GROUP BY phone 
      HAVING COUNT(*) > 1
    `;
    
    if (duplicatePhones.length > 0) {
      console.log('Warning: Found duplicate phone numbers:');
      duplicatePhones.forEach(dup => {
        console.log(`- ${dup.phone}: ${dup.count} occurrences`);
      });
      console.log('Please fix duplicate phone numbers before adding the unique constraint.');
    } else {
      console.log('No duplicate phone numbers found, proceeding...');
      
      // Check if the constraint already exists
      const phoneConstraintExists = await sql`
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_phone_key' AND conrelid = 'users'::regclass
      `;
      
      if (phoneConstraintExists.length === 0) {
        // Clean up empty phone values
        await sql`UPDATE users SET phone = NULL WHERE phone = ''`;
        
        // Add the constraint
        console.log('Adding unique constraint for phone...');
        await sql`ALTER TABLE users ADD CONSTRAINT users_phone_key UNIQUE (phone)`;
        console.log('Unique constraint for phone added successfully!');
      } else {
        console.log('Phone unique constraint already exists');
      }
    }
    
    // Show users table schema
    console.log('\nUsers table columns and constraints:');
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;
    
    columns.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type})`);
    });
    
    const constraints = await sql`
      SELECT con.conname as constraint_name, con.contype as constraint_type,
             pg_get_constraintdef(con.oid) as constraint_definition
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      WHERE rel.relname = 'users'
    `;
    
    console.log('\nConstraints:');
    constraints.forEach(con => {
      let type = '';
      switch(con.constraint_type) {
        case 'p': type = 'PRIMARY KEY'; break;
        case 'u': type = 'UNIQUE'; break;
        case 'f': type = 'FOREIGN KEY'; break;
        case 'c': type = 'CHECK'; break;
        default: type = con.constraint_type;
      }
      console.log(`- ${con.constraint_name} (${type}): ${con.constraint_definition}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
addUniqueConstraints();
