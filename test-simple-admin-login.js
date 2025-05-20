// test-simple-admin-login.js - Test login with our simple admin user

import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

async function testSimpleAdminLogin() {
  try {
    // Simple admin credentials
    const email = 'simple.admin@keshevplus.co.il';
    const password = 'admin123';
    
    console.log('\n===== TESTING SIMPLE ADMIN LOGIN =====');
    console.log(`Attempting to log in with email: ${email}`);
    
    // Determine the API URL to use
    const apiUrl = process.env.API_URL || 'https://api.keshevplus.co.il';
    const loginUrl = `${apiUrl}/auth/login`;
    console.log(`Login API URL: ${loginUrl}`);
    
    // Prepare login request - try with password only
    console.log('Preparing login request payload...');
    const payload = {
      email,
      password
    };
    console.log('Request payload:', payload);
    
    // Make the login request
    console.log('Sending login request...');
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    // Parse the response
    const responseData = await response.json();
    
    if (response.ok) {
      console.log('LOGIN SUCCESSFUL! ✅');
      console.log('User details:');
      // Filter out sensitive information for logging
      const { password_hash, ...safeUserData } = responseData;
      console.log(JSON.stringify(safeUserData, null, 2));
      
      // Check if token is included in the response
      if (responseData.token) {
        console.log(`JWT Token received: ${responseData.token.substring(0, 20)}...`);
      } else {
        console.log('No JWT token received in the response');
      }
    } else {
      console.log('LOGIN FAILED! ❌');
      console.log('Error response:');
      console.log(JSON.stringify(responseData, null, 2));
    }
  } catch (error) {
    console.error('Error during login test:', error);
  }
}

// Run the test
testSimpleAdminLogin();
