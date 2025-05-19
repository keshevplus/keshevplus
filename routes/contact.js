import express from 'express';
import pool from '../db/index.js'; 
import { sendEmail } from '../services/emailService.js'; 
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
// Server-side logging

router.post('/', async (req, res) => {
  const { name, email, phone, subject, message, source = 'Contact Form' } = req.body;

  if (!name || !phone || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email, and message are required fields.' });
  }

  try {// Server-side logging

    // 1. Save to database (leads table)
    const dbResult = await pool.query(
      'INSERT INTO leads (name, email, phone, subject, message, source, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [name, email || null, phone || null, subject || 'Contact Form Submission', message, source, 'new']
    );
    const newLeadId = dbResult.rows[0]?.id;
    console.log(`Lead saved with ID: ${newLeadId}`);

    // 2. Send email notification
    const emailTo = process.env.EMAIL_TO || 'pluskeshev@gmail.com'; 
    const emailSubject = `New Contact Form Submission: ${subject || name}`;
    const emailHtml = `
      <h1>New Contact Form Submission</h1>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
      <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
      <hr>
      <p>This lead has been saved to the database with ID: ${newLeadId}.</p>
    `;
    const emailText = `
      New Contact Form Submission:
      Name: ${name}
      Email: ${email}
      ${phone ? `Phone: ${phone}` : ''}
      Subject: ${subject || 'N/A'}
      Message: ${message}
      ---
      Lead ID: ${newLeadId}
    `;

    await sendEmail(emailTo, emailSubject, emailHtml, emailText);
    console.log('Contact form email notification sent successfully.');

    res.status(200).json({ 
      success: true, 
      message: 'Contact form submitted successfully. We will get back to you soon.',
      leadId: newLeadId 
    });

  } catch (error) {
    console.error('Error processing contact form:', error);
    res.status(500).json({ success: false, message: 'An error occurred while submitting the form. Please try again later.' });
  }
});

export default router;