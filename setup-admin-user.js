// setup-admin-user.js - Script to create or update admin user with password 12345678

import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Database connection
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL environment variable not found.');
  process.exit(1);
}

const sql = neon(databaseUrl);

// Admin user credentials to set up
const adminEmail = 'dr@keshevplus.co.il';
const adminPassword = '12345678'; // Will be hashed
const adminName = 'Dr. Irine';

async function setupAdminUser() {
  try {
    console.log('Starting admin user setup...');
    
    // Check if user exists directly with SQL
    console.log(`Checking if user ${adminEmail} exists...`);
    const userCheck = await sql`SELECT id, email, role FROM users WHERE email = ${adminEmail}`;
    const existingUser = userCheck.length > 0 ? userCheck[0] : null;
    
    // Hash the password with salt=10
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    console.log('Password hashed successfully');
    
    let result;
    if (existingUser) {
      // Update existing user
      console.log(`User ${adminEmail} found with ID: ${existingUser.id}. Updating password and role...`);
      
      result = await sql`
        UPDATE users 
        SET password_hash = ${hashedPassword}, 
            role = 'admin', 
            updated_at = CURRENT_TIMESTAMP,
            logged_in = false
        WHERE email = ${adminEmail}
        RETURNING id, email, role
      `;
    } else {
      // Create new admin user
      console.log(`User ${adminEmail} not found. Creating new admin user...`);
      
      result = await sql`
        INSERT INTO users (
          name, 
          email, 
          password_hash, 
          role, 
          created_at,
          status
        ) VALUES (
          ${adminName},
          ${adminEmail},
          ${hashedPassword},
          'admin',
          CURRENT_TIMESTAMP,
          'active'
        )
        RETURNING id, email, role
      `;
    }
    
    // Use the first result
    const user = result[0];
    console.log(`Admin user ${existingUser ? 'updated' : 'created'}: ID=${user.id}, Email=${user.email}, Role=${user.role}`);
    
    // Display password hash for verification if needed
    console.log(`Password hash generated: ${hashedPassword.substring(0, 20)}...`);
    
    console.log('Admin user setup completed successfully!');
    console.log(`You can now login with: ${adminEmail} and the password: 12345678`);
    
  } catch (error) {
    console.error('Error setting up admin user:', error);
  }
}

// Run the setup function
setupAdminUser();
