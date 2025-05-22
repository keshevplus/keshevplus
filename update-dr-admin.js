// update-dr-admin.js - Update the dr@keshevplus.co.il admin password

import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function updateDrAdmin() {
  try {
    // Admin details
    const email = 'dr@keshevplus.co.il';
    const password = 'changeme';
    
    console.log(`Updating admin user password: ${email}`);
    
    // Get database URL
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('DATABASE_URL environment variable not found.');
      process.exit(1);
    }
    
    // Create SQL connection
    const sql = neon(databaseUrl);
    
    // Check if the user exists
    const existingUser = await sql`SELECT id, email, name FROM users WHERE email = ${email}`;
    
    if (existingUser.length === 0) {
      console.error(`User with email ${email} does not exist.`);
      return;
    }
    
    console.log('Found existing user:', existingUser[0]);
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Update the user's password
    const result = await sql`
      UPDATE users
      SET 
        password_hash = ${passwordHash},
        logged_in = false,
        updated_at = CURRENT_TIMESTAMP
      WHERE email = ${email}
      RETURNING id, email, name, role
    `;
    
    console.log('Updated admin user password:');
    console.log(result[0]);
    console.log(`\nYou can now log in with:\nEmail: ${email}\nPassword: ${password}`);
  } catch (error) {
    console.error('Error updating admin user:', error);
  }
}

// Run the function
updateDrAdmin();
