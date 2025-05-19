import express from 'express';
import pool from '../db/index.js'; 
import { neon } from '@neondatabase/serverless';
import { sendEmail } from '../services/emailService.js'; 
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

    // 1. Save to messages table in NeonDB
    const messagesResult = await sql`
      INSERT INTO messages (name, email, phone, subject, message, created_at, read_at)
      VALUES (
        ${sanitizedData.name},
        ${sanitizedData.email},
        ${sanitizedData.phone},
        ${sanitizedData.subject},
        ${sanitizedData.message},
        CURRENT_TIMESTAMP,
        NULL
      )
      RETURNING id
    `;
    
    const messageId = messagesResult[0]?.id;
    console.log(`Message saved to messages table with ID: ${messageId}`);

    // 2. Save to leads table in NeonDB
    const leadsResult = await sql`
      INSERT INTO leads (name, email, phone, subject, message, date_received, status)
      VALUES (
        ${sanitizedData.name},
        ${sanitizedData.email},
        ${sanitizedData.phone},
        ${sanitizedData.subject},
        ${sanitizedData.message},
        CURRENT_TIMESTAMP,
        'new'
      )
      RETURNING id
    `;
    
    const leadId = leadsResult[0]?.id;
    console.log(`Contact also saved to leads table with ID: ${leadId}`);

    // 3. Send email notification
    const emailTo = process.env.EMAIL_TO || 'pluskeshev@gmail.com'; 
    const emailSubject = `New Contact Form Submission: ${sanitizedData.subject || sanitizedData.name}`;
    const emailHtml = `
      <h1>New Contact Form Submission</h1>
      <p><strong>Name:</strong> ${sanitizedData.name}</p>
      <p><strong>Email:</strong> ${sanitizedData.email}</p>
      <p><strong>Phone:</strong> ${sanitizedData.phone}</p>
      <p><strong>Subject:</strong> ${sanitizedData.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${sanitizedData.message}</p>
      <hr>
      <p>This contact has been saved to the database:</p>
      <p>- Message ID: ${messageId}</p>
      <p>- Lead ID: ${leadId}</p>
    `;
    
    const emailText = `
      New Contact Form Submission:
      Name: ${sanitizedData.name}
      Email: ${sanitizedData.email}
      Phone: ${sanitizedData.phone}
      Subject: ${sanitizedData.subject}
      Message: ${sanitizedData.message}
      ---
      Message ID: ${messageId}
      Lead ID: ${leadId}
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