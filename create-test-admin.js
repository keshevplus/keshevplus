// create-test-admin.js - Create a test admin user and log the process

import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function createTestAdmin() {
  try {
    console.log('Starting test admin user creation...');
    
    // Get database URL
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('DATABASE_URL environment variable not found.');
      process.exit(1);
    }
    console.log('Database URL found');
    
    // Create SQL connection
    const sql = neon(databaseUrl);
    console.log('Database connection established');
    
    // User details
    const email = 'test.admin@keshevplus.co.il';
    const password = 'test12345';
    const name = 'Test Admin';
    console.log(`Creating admin user with email: ${email}`);
    
    // Check if user exists
    console.log('Checking if user already exists...');
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    
    // Generate password hash
    console.log('Generating password hash...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    console.log(`Password hash created: ${passwordHash.substring(0, 15)}...`);
    
    if (users.length > 0) {
      // Update existing user
      const user = users[0];
      console.log(`User ${email} already exists with ID: ${user.id}. Updating...`);
      
      await sql`
        UPDATE users 
        SET 
          password_hash = ${passwordHash},
          name = ${name},
          role = 'admin'
        WHERE id = ${user.id}
      `;
      
      console.log(`Updated test admin account successfully!`);
      console.log('User details:', user);
    } else {
      // Create new user
      console.log('User does not exist. Creating new admin user...');
      const result = await sql`
        INSERT INTO users (name, email, password_hash, role, created_at, updated_at, status)
        VALUES (
          ${name},
          ${email},
          ${passwordHash},
          'admin',
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP,
          'active'
        )
        RETURNING id, email, name, role
      `;
      
      console.log(`Created new admin account with ID: ${result[0].id}`);
      console.log('User details:', result[0]);
    }
    
    console.log(`\nTest admin can now log in with:\nEmail: ${email}\nPassword: ${password}`);
  } catch (error) {
    console.error('Error creating test admin:', error);
  }
}

// Run the script
createTestAdmin();
