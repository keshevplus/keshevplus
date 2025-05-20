// create-alon-admin.js - Simple script to create an admin user for Alon

import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL environment variable not found.');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function createAlonAdmin() {
  try {
    console.log('Starting admin user creation for Alon...');
    
    // User details
    const email = 'alonkochav@gmail.com';
    const password = '12345678';
    const name = 'Alon';
    
    // Check if user exists
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    
    // Generate password hash
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
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
      
      console.log(`Updated Alon's admin account successfully!`);
    } else {
      // Create new user
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
        RETURNING id, email
      `;
      
      console.log(`Created new admin account for Alon with ID: ${result[0].id}`);
    }
    
    console.log(`\nAlon can now log in with:\nEmail: ${email}\nPassword: ${password}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
createAlonAdmin();
