// test-admin-login.js - Test the admin login functionality with detailed logging

import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

async function testAdminLogin() {
  try {
    // User credentials for the test admin we just created
    const email = 'test.admin@keshevplus.co.il';
    const password = 'test12345';
    
    console.log('\n===== TESTING ADMIN LOGIN =====');
    console.log(`Attempting to log in with email: ${email}`);
    
    // Determine the API URL to use
    const apiUrl = process.env.API_URL || 'https://api.keshevplus.co.il';
    const loginUrl = `${apiUrl}/auth/login`;
    console.log(`Login API URL: ${loginUrl}`);
    
    // Prepare login request
    console.log('Preparing login request payload...');
    const payload = {
      email,
      password,
      password_hash: password // Try with both parameters
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
        console.log(`JWT Token received (first 20 chars): ${responseData.token.substring(0, 20)}...`);
        
        // Test accessing a protected endpoint with the token
        console.log('\n===== TESTING PROTECTED ENDPOINT =====');
        const protectedUrl = `${apiUrl}/admin/user`;
        console.log(`Accessing protected endpoint: ${protectedUrl}`);
        
        const protectedResponse = await fetch(protectedUrl, {
          headers: {
            'Authorization': `Bearer ${responseData.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`Protected endpoint response status: ${protectedResponse.status} ${protectedResponse.statusText}`);
        
        if (protectedResponse.ok) {
          const protectedData = await protectedResponse.json();
          console.log('Protected data received:');
          console.log(JSON.stringify(protectedData, null, 2));
        } else {
          console.log('Failed to access protected endpoint');
          try {
            const errorData = await protectedResponse.text();
            console.log('Error response:', errorData);
          } catch (e) {
            console.log('Could not parse error response');
          }
        }
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
testAdminLogin();
