import express from 'express';
import pool from '../db/index.js'; 
import { neon } from '@neondatabase/serverless';
import { sendEmail } from '../services/emailService.js'; 
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Create SQL instance with Neon for direct database access
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('No DATABASE_URL found in environment variables. Please check your .env file.');
}
const sql = neon(databaseUrl + '?sslmode=require');

console.log('Contact route initialized with Neon database connection');

router.post('/', async (req, res) => {
  const { name, email, phone, subject, message, source = 'Contact Form' } = req.body;

  if (!name || !phone || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email, and message are required fields.' });
  }

  try {
    console.log('Processing contact form submission', { name, email, phone });

    // Sanitize input data
    const sanitizedData = {
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : null,
      phone: phone.trim(),
      subject: subject ? subject.trim() : 'Contact Form Submission',
      message: message.trim(),
      source: source,
      created_at: new Date().toISOString()
    };

    // Set timezone for all database operations to Israel
    await sql`SET TIME ZONE 'Asia/Jerusalem'`;
    
    // 3. First check if user exists or create new user - do this BEFORE messages and leads
    // to ensure we have a valid user_id to link to
    let user = null;
    let isNewUser = true;
    
    try {
      // Create a user object from the contact data
      const userData = {
        name: sanitizedData.name,
        email: sanitizedData.email,
        phone: sanitizedData.phone
      };
      
      // Use the enhanced findOrCreateFromContact method that handles duplicates
      user = await User.findOrCreateFromContact(userData);
      
      if (user) {
        isNewUser = user.matchType === 'new';
        console.log(`User ${isNewUser ? 'created' : 'found'} with ID: ${user.id}`);
      } else {
        console.warn('Failed to find or create user, proceeding without user_id reference');
      }
    } catch (userError) {
      console.error('Error processing user data from contact form:', userError);
      // Continue without user_id if there's an error
    }
    
    // 1. Save to messages table in NeonDB with timezone-aware timestamp and user_id if available
    const messagesResult = await sql`
      INSERT INTO messages (name, email, phone, subject, message, created_at, read_at, user_id)
      VALUES (
        ${sanitizedData.name},
        ${sanitizedData.email},
        ${sanitizedData.phone},
        ${sanitizedData.subject},
        ${sanitizedData.message},
        CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jerusalem',
        NULL,
        ${user ? user.id : null}
      )
      RETURNING id
    `;
    
    const messageId = messagesResult[0]?.id;
    console.log(`Message saved to messages table with ID: ${messageId}`);

    // 2. Save to leads table in NeonDB with Israeli timezone and user_id if available
    const leadsResult = await sql`
      INSERT INTO leads (name, email, phone, subject, message, date_received, status, user_id)
      VALUES (
        ${sanitizedData.name},
        ${sanitizedData.email},
        ${sanitizedData.phone},
        ${sanitizedData.subject},
        ${sanitizedData.message},
        CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jerusalem',
        'new',
        ${user ? user.id : null}
      )
      RETURNING id
    `;
    
    const leadId = leadsResult[0]?.id;
    
    // We've already handled user creation/finding earlier in the code
    // existingUserInfo will be the found user if they already exist
    // Prepare variables for notification
    let existingUserInfo = user && !isNewUser ? user : null;
    let findMethod = user ? user.matchType : '';    
    console.log(`Contact also saved to leads table with ID: ${leadId}`);

    // 4. Send email notification
    const emailTo = process.env.EMAIL_TO || 'pluskeshev@gmail.com'; 
    const emailSubject = `New Contact Form Submission: ${sanitizedData.subject || sanitizedData.name}`;
    // Get a formatted timestamp for the current date/time
    const now = new Date();
    const formattedDate = now.toLocaleDateString('he-IL', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
    const formattedTime = now.toLocaleTimeString('he-IL', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
    const timestamp = `${formattedDate} ${formattedTime}`;
    
    // Prepare user notification - either new or existing user info
    let userInfoSection = '';
    
    if (user) {
      const userCreatedAt = user.created_at 
        ? new Date(user.created_at).toLocaleDateString('he-IL') 
        : 'unknown date';
        
      if (isNewUser) {
        // This is a new user
        userInfoSection = `
        <div style="background-color: #d4edda; padding: 10px; border-left: 4px solid #28a745; margin: 10px 0;">
          <h3 style="color: #155724; margin-top: 0;">🎉 New Contact</h3>
          <p>This is the first message from this contact. A new user has been created:</p>
          <ul>
            <li><strong>User ID:</strong> ${user.id}</li>
            <li><strong>Name:</strong> ${user.name || user.username || sanitizedData.name}</li>
            <li><strong>Email:</strong> ${user.email || sanitizedData.email || 'Not provided'}</li>
            <li><strong>Phone:</strong> ${user.phone || sanitizedData.phone || 'Not provided'}</li>
            <li><strong>Added to system:</strong> ${userCreatedAt}</li>
          </ul>
        </div>
        `;
      } else {
        // This is a returning user
        userInfoSection = `
        <div style="background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 10px 0;">
          <h3 style="color: #856404; margin-top: 0;">⚠️ Returning Contact</h3>
          <p>This person already exists in your database:</p>
          <ul>
            <li><strong>User ID:</strong> ${user.id}</li>
            <li><strong>Name in database:</strong> ${user.name || user.username || 'Not specified'}</li>
            <li><strong>Email in database:</strong> ${user.email || 'Not specified'}</li>
            <li><strong>Phone in database:</strong> ${user.phone || 'Not specified'}</li>
            <li><strong>First added to system:</strong> ${userCreatedAt}</li>
            <li><strong>Role:</strong> ${user.role || 'Not specified'}</li>
          </ul>
          <p><strong>Match found by:</strong> ${findMethod}</p>
        </div>
        `;
      }
    } else {
      // Failed to create or find user
      userInfoSection = `
      <div style="background-color: #f8d7da; padding: 10px; border-left: 4px solid #dc3545; margin: 10px 0;">
        <h3 style="color: #721c24; margin-top: 0;">❌ User Processing Failed</h3>
        <p>Unable to create or locate a user record for this contact. The message has been saved without a user reference.</p>
      </div>
      `;
    }
    
    const emailHtml = `
      <h1>New Contact Form Submission</h1>
      <p><strong>Name:</strong> ${sanitizedData.name}</p>
      <p><strong>Email:</strong> ${sanitizedData.email}</p>
      <p><strong>Phone:</strong> ${sanitizedData.phone}</p>
      <p><strong>Subject:</strong> ${sanitizedData.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${sanitizedData.message}</p>
      ${userInfoSection}
      <hr>
      <p>This contact has been saved to the database:</p>
      <p>- Message ID: ${messageId}</p>
      <p>- Lead ID: ${leadId}</p>
      <p>- User ID: ${user ? user.id : 'Not linked'}</p>
      <p>- Date received: ${timestamp}</p>
    `;
    
    // Plain text version with user info (new or existing)
    let userInfoTextSection = '';
    
    if (user) {
      const userCreatedAt = user.created_at 
        ? new Date(user.created_at).toLocaleDateString('he-IL') 
        : 'unknown date';
      
      if (isNewUser) {
        // New user text version
        userInfoTextSection = `
      🎉 NEW CONTACT
      This is the first message from this contact. A new user has been created:
      - User ID: ${user.id}
      - Name: ${user.name || user.username || sanitizedData.name}
      - Email: ${user.email || sanitizedData.email || 'Not provided'}
      - Phone: ${user.phone || sanitizedData.phone || 'Not provided'}
      - Added to system: ${userCreatedAt}
      `;
      } else {
        // Returning user text version
        userInfoTextSection = `
      ⚠️ RETURNING CONTACT
      This person already exists in your database:
      - User ID: ${user.id}
      - Name in database: ${user.name || user.username || 'Not specified'}
      - Email in database: ${user.email || 'Not specified'}
      - Phone in database: ${user.phone || 'Not specified'}
      - First added to system: ${userCreatedAt}
      - Role: ${user.role || 'Not specified'}
      - Match found by: ${findMethod}
      `;
      }
    } else {
      // Failed user text version
      userInfoTextSection = `
      ❌ USER PROCESSING FAILED
      Unable to create or locate a user record for this contact.
      The message has been saved without a user reference.
      `;
    }
    
    const emailText = `
      New Contact Form Submission:
      Name: ${sanitizedData.name}
      Email: ${sanitizedData.email}
      Phone: ${sanitizedData.phone}
      Subject: ${sanitizedData.subject}
      Message: ${sanitizedData.message}
      ${userInfoTextSection}
      ---
      Message ID: ${messageId}
      Lead ID: ${leadId}
      User ID: ${user ? user.id : 'Not linked'}
      Date received: ${timestamp}
    `;

    await sendEmail(emailTo, emailSubject, emailHtml, emailText);
    console.log('Contact form email notification sent successfully.');

    res.status(200).json({ 
      success: true, 
      message: 'Contact form submitted successfully. We will get back to you soon.',
      messageId: messageId,
      leadId: leadId 
    });

  } catch (error) {
    console.error('Error processing contact form:', error);
    res.status(500).json({ success: false, message: 'An error occurred while submitting the form. Please try again later.' });
  }
});

export default router;