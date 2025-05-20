// reset-admin-login-status.js - Reset all admin users' logged_in status to false

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

async function resetAdminLoginStatus() {
  try {
    console.log('Starting admin login status reset...');
    
    // Get database URL
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('DATABASE_URL environment variable not found.');
      process.exit(1);
    }
    
    // Create SQL connection
    const sql = neon(databaseUrl);
    
    // First check which admins are currently logged in
    console.log('Checking currently logged in admins...');
    const loggedInAdmins = await sql`
      SELECT id, name, email, logged_in 
      FROM users 
      WHERE role = 'admin' AND logged_in = true
    `;
    
    if (loggedInAdmins.length > 0) {
      console.log('Found logged in admins:');
      loggedInAdmins.forEach(admin => {
        console.log(`- ${admin.name} (${admin.email}): logged_in = ${admin.logged_in}`);
      });
    } else {
      console.log('No admins are currently logged in.');
    }
    
    // Reset all admin users to logged_in = false
    console.log('\nResetting all admin users to logged_in = false...');
    const updateResult = await sql`
      UPDATE users 
      SET logged_in = false 
      WHERE role = 'admin'
      RETURNING id, name, email
    `;
    
    console.log(`Reset ${updateResult.length} admin users:`);
    updateResult.forEach(admin => {
      console.log(`- ${admin.name} (${admin.email}): logged_in = false`);
    });
    
    console.log('\nAdmin login status reset completed successfully!');
  } catch (error) {
    console.error('Error resetting admin login status:', error);
  }
}

// Run the script
resetAdminLoginStatus();
