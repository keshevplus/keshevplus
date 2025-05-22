// create-dr-admin.js - Create a new admin user for dr@keshevplus.co.il

import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function createDrAdmin() {
  try {
    // Admin details
    const email = 'dr@keshevplus.co.il';
    const password = 'changeme';
    const name = 'Dr Admin';
    
    console.log(`Creating admin user: ${email}`);
    
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
    const deleteResult = await sql`DELETE FROM users WHERE email = ${email}`;
    console.log('Deleted any existing user with this email');
    
    // Create the admin user
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
    
    console.log('Created admin user:');
    console.log(result[0]);
    console.log(`\nYou can now log in with:\nEmail: ${email}\nPassword: ${password}`);
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Run the function
createDrAdmin();
