// verify-admin-user.js - Check the test admin user's data in the database

import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function verifyAdminUser() {
  try {
    const email = 'test.admin@keshevplus.co.il';
    const password = 'test12345';
    
    console.log(`Verifying admin user: ${email}`);
    
    // Get database URL
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('DATABASE_URL environment variable not found.');
      process.exit(1);
    }
    
    // Create SQL connection
    const sql = neon(databaseUrl);
    
    // Get the user by email
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    
    if (users.length === 0) {
      console.log(`User with email ${email} not found in the database!`);
      return;
    }
    
    const user = users[0];
    console.log('User found in database:');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('Role:', user.role);
    console.log('Status:', user.status);
    console.log('Logged In:', user.logged_in);
    console.log('Password Hash exists:', !!user.password_hash);
    
    if (user.password_hash) {
      // Test manual password verification
      console.log('\nTesting password verification with bcrypt...');
      const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
      console.log(`Password '${password}' matches stored hash: ${isPasswordMatch}`);
      
      if (!isPasswordMatch) {
        console.log('\nPassword does not match! Try updating it:');
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(password, salt);
        console.log(`New hash for '${password}': ${newHash}`);
        
        // Update the password hash
        console.log('\nUpdating password hash in database...');
        await sql`
          UPDATE users 
          SET password_hash = ${newHash}
          WHERE id = ${user.id}
        `;
        console.log('Password hash updated!');
        
        // Verify the update
        const updatedUser = await sql`SELECT id, email, password_hash FROM users WHERE id = ${user.id}`;
        const verifyUpdate = await bcrypt.compare(password, updatedUser[0].password_hash);
        console.log(`Verification after update: Password '${password}' matches new hash: ${verifyUpdate}`);
      }
    } else {
      console.log('\nUser has no password hash stored! Adding one:');
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(password, salt);
      console.log(`New hash for '${password}': ${newHash}`);
      
      // Add the password hash
      await sql`
        UPDATE users 
        SET password_hash = ${newHash}
        WHERE id = ${user.id}
      `;
      console.log('Password hash added!');
    }
    
    console.log('\nDone verifying admin user!');
  } catch (error) {
    console.error('Error verifying admin user:', error);
  }
}

// Run the verification
verifyAdminUser();
