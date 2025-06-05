import express from 'express';
import pool from '../services/database.js'; 
import { sendEmail } from '../services/emailService.js'; 
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

console.log('Contact route initialized with shared PG pool');

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

    // First test database connection to ensure it's active
    const isConnected = await pool.testConnection();
    if (!isConnected) {
      console.error('Database connection failed, saving message locally only');
      return res.status(503).json({
        success: false,
        message: 'Database service unavailable. Your message has been saved locally and will be sent when the service is available.'
      });
    }

    // Set timezone for all database operations to Israel
    await pool.query(`SET TIME ZONE 'Asia/Jerusalem'`);
    
    // 3. First check if user exists or create new user - do this BEFORE messages and messages
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
      
      // Use the enhanced findOrCreateFromContact method
      user = await User.findOrCreateFromContact(userData);
      
      if (user) {
        isNewUser = user.matchType === 'new';
        console.log(`User ${isNewUser ? 'created' : 'found'} with ID: ${user.id}`);
        
        // --- new: update any blank user fields with incoming data ---
        if (!isNewUser) {
          const updates = {};
          if (!user.name && sanitizedData.name)   updates.name  = sanitizedData.name;
          if (!user.email && sanitizedData.email) updates.email = sanitizedData.email;
          if (!user.phone && sanitizedData.phone) updates.phone = sanitizedData.phone;
          
          if (Object.keys(updates).length) {
            // build SET clause and values array
            const cols   = Object.keys(updates);
            const vals   = Object.values(updates);
            const setSQL = cols.map((col, i) => `${col} = $${i+1}`).join(', ');
            // append user.id as last parameter
            await pool.query(
              `UPDATE users SET ${setSQL} WHERE id = $${cols.length + 1}`,
              [...vals, user.id]
            );
            console.log('Updated user record with new contact info:', updates);
          }
        }
      } else {
        console.warn('Failed to find or create user, proceeding without user_id reference');
      }
    } catch (userError) {
      console.error('Error processing user data from contact form:', userError);
      // Continue without user_id if there's an error
    }
    
    // Wrap database operations in try/catch blocks
    try {
      // 1. Save to messages table in NeonDB with timezone-aware timestamp and user_id if available
      const messagesResult = await pool.query(
        `INSERT INTO messages (name, email, phone, subject, message, created_at, read_at, user_id)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jerusalem', NULL, $6)
        RETURNING id`,
        [
          sanitizedData.name,
          sanitizedData.email,
          sanitizedData.phone,
          sanitizedData.subject,
          sanitizedData.message,
          user ? user.id : null
        ]
      );
      
      const messageId = messagesResult.rows[0]?.id;
      console.log(`Message saved to messages table with ID: ${messageId}`);
    } catch (dbError) {
      console.error('Error saving to messages table:', dbError);
      // Continue execution to try saving to messages table
    }

    // try {
    //   // 2. Save to messages table in NeonDB with Israeli timezone and user_id if available
    //   const messagesResult = await pool.query(
    //     `INSERT INTO messages (name, email, phone, subject, message, created_at, status, user_id)
    //     VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jerusalem', 'new', $6)
    //     RETURNING id`,
    //     [
    //       sanitizedData.name,
    //       sanitizedData.email,
    //       sanitizedData.phone,
    //       sanitizedData.subject,
    //       sanitizedData.message,
    //       user ? user.id : null
    //     ]
    //   );
      
    //   const messageId = messagesResult.rows[0]?.id;
    //   console.log(`Contact also saved to messages table with ID: ${messageId}`);
    // } catch (dbError) {
    //   console.error('Error saving to messages table:', dbError);
    //   // Continue execution to send the email
    // }

    // Prepare variables for notification
    let existingUserInfo = user && !isNewUser ? user : null;
    let findMethod = user ? user.matchType : '';    

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
      <p>- Lead ID: ${messageId}</p>
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
      Lead ID: ${messageId}
      User ID: ${user ? user.id : 'Not linked'}
      Date received: ${timestamp}
    `;

    await sendEmail(emailTo, emailSubject, emailHtml, emailText);
    console.log('Contact form email notification sent successfully.');

    res.status(200).json({ 
      success: true, 
      message: 'Contact form submitted successfully. We will get back to you soon.',
      messageId: messageId,
      messageId: messageId 
    });

  } catch (error) {
    console.error('Error processing contact form:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while submitting the form. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;