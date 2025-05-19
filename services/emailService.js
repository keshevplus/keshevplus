// services/emailService.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Create a transporter object using Gmail SMTP
// Ensure you have EMAIL_SMTP_HOST, EMAIL_SMTP_PORT, EMAIL_SMTP_SECURE,
// EMAIL_SMTP_USER, and EMAIL_SMTP_PASS defined in your .env file
// and in your Vercel environment variables for the backend.

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST, // Should be 'smtp.gmail.com'
  port: parseInt(process.env.EMAIL_SMTP_PORT || '465', 10), // 465 for SSL, 587 for TLS
  secure: process.env.EMAIL_SMTP_PORT === '465', // true if port is 465
  auth: {
    user: process.env.EMAIL_SMTP_USER, // Your Gmail address (e.g., yourname@gmail.com)
    pass: process.env.EMAIL_SMTP_PASS, // Your Gmail App Password
  },
  // Optional: Add TLS options if needed, e.g., for local development with self-signed certs
  // or if you encounter issues with TLS versions.
  // tls: {
  //   ciphers:'SSLv3', // Example: Forcing a cipher, usually not needed for Gmail
  //   rejectUnauthorized: false // DANGEROUS: Only for dev with self-signed certs
  // }
});

/**
 * Sends an email using the pre-configured Nodemailer transporter.
 * @param {string} to Recipient's email address.
 * @param {string} subject Email subject.
 * @param {string} html HTML content of the email.
 * @param {string} text Plain text content of the email (fallback).
 * @returns {Promise<object>} Promise resolving to the info object from Nodemailer.
 * @throws {Error} Throws an error if email sending fails.
 */
export async function sendEmail(to, subject, html, text) {
  const mailOptions = {
    from: `"Keshev Plus" <${process.env.EMAIL_FROM || process.env.EMAIL_SMTP_USER}>`, // Sender address (display name and email)
    to: to, // List of receivers
    subject: subject, // Subject line
    text: text, // Plain text body
    html: html, // HTML body
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully via Nodemailer: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email via Nodemailer:', error);
    // Log specific SMTP errors if available
    if (error.responseCode) {
      console.error(`SMTP Error Code: ${error.responseCode}`);
      console.error(`SMTP Error Message: ${error.response}`);
    }
    throw error; // Re-throw the error to be caught by the caller in routes/contact.js
  }
}