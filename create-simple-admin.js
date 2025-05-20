// create-simple-admin.js - Create a very simple admin user for testing

import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function createSimpleAdmin() {
  try {
    // Test admin details
    const email = 'simple.admin@keshevplus.co.il';
    const password = 'admin123';
    const name = 'Simple Admin';
    
    console.log(`Creating simple admin user: ${email}`);
    
    // Get database URL
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('DATABASE_URL environment variable not found.');
      process.exit(1);
    }
    
    // Create SQL connection
    const sql = neon(databaseUrl);
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // First, delete if exists to ensure we're starting fresh
    await sql`DELETE FROM users WHERE email = ${email}`;
    console.log('Deleted any existing user with this email');
    
    // Create a very simple admin user with minimal fields
    const result = await sql`
      INSERT INTO users (
        name, 
        email, 
        password_hash, 
        role, 
        status,
        logged_in,
        created_at, 
        updated_at
      ) 
      VALUES (
        ${name},
        ${email},
        ${passwordHash},
        'admin',
        'active',
        false,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      RETURNING id, email, name, role
    `;
    
    console.log('Created simple admin user:');
    console.log(result[0]);
    console.log(`\nYou can now try to log in with:\nEmail: ${email}\nPassword: ${password}`);
    
    // Add to environment variables for passwordless login
    console.log('\nIMPORTANT: For passwordless login during development, add this to your .env.local file:');
    console.log(`VITE_DEV_ADMIN_EMAIL=${email}`);
  } catch (error) {
    console.error('Error creating simple admin user:', error);
  }
}

// Run the function
createSimpleAdmin();
