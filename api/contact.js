import axios from 'axios';
import { sendLeadNotification, sendLeadAcknowledgment } from '../utils/mailer.js';
// Added mailer import for sending notification and acknowledgment emails

// CORS setup: You can allow multiple origins by checking req.headers.origin and conditionally setting the header
// List of allowed origins for CORS
const allowedOrigins = [
  'https://keshevplus.co.il',
  'https://www.keshevplus.co.il',
];

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]); // fallback to main domain
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // Add this only if you need cookies/auth: res.setHeader('Access-Control-Allow-Credentials', 'true');
}

function getMissingFieldErrors(body) {
  return [
    { field: 'name', message: !body.name ? 'Name is required' : '' },
    { field: 'email', message: !body.email ? 'Email is required' : '' },
    { field: 'phone', message: !body.phone ? 'Phone is required' : '' },
    { field: 'message', message: !body.message ? 'Message is required' : '' },
  ].filter(e => e.message);
}

function getBaseUrl() {
  const isDev = process.env.NODE_ENV === 'development' && process.env.VERCEL_ENV === 'development';
  if (isDev) {
    return 'http://localhost:5000';
  }
  return 'https://api.keshevplus.co.il';
}

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Health check endpoint
  if (req.method === 'GET') {
    res.status(200).json({ message: 'Contact API is available', success: true });
    return;
  }

  // Handle POST (contact form)
  if (req.method === 'POST') {
    let body = req.body;
    // Vercel: body may not be parsed automatically
    if (!body || typeof body !== 'object') {
      try {
        let raw = '';
        for await (const chunk of req) { raw += chunk; }
        body = JSON.parse(raw);
      } catch (e) {
        res.status(400).json({ success: false, message: 'Invalid JSON body', error: e.message });
        return;
      }
    }

    const errors = getMissingFieldErrors(body);
    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields',
        errors,
      });
      return;
    }
    try {
      const baseUrl = getBaseUrl();
      const response = await axios({
        method: 'post',
        url: `${baseUrl}/neon/leads`,
        data: body,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      // After successful lead creation, send notification and acknowledgment emails
      let notificationResult = false;
      let acknowledgmentResult = false;
      try {
        notificationResult = await sendLeadNotification(body);
      } catch (err) {
        console.error('Failed to send admin notification email:', err);
      }
      try {
        acknowledgmentResult = await sendLeadAcknowledgment(body);
      } catch (err) {
        console.error('Failed to send acknowledgment email to lead:', err);
      }
      // Respond to frontend regardless of email result
      res.status(200).json({
        success: true,
        message: 'Form submitted successfully',
        data: response.data,
        emailNotificationSent: notificationResult,
        emailAcknowledgmentSent: acknowledgmentResult,
      });
      return;
    } catch (error) {
      // Log error server-side
      console.error('Error forwarding to neon leads:', {
        message: error.message,
        stack: error.stack,
        requestData: body,
      });
      // Only show stack in development
      const isDev = process.env.NODE_ENV === 'development';
      res.status(500).json({
        success: false,
        message: 'Failed to submit form',
        error: error.message,
        ...(isDev ? { stack: error.stack, requestData: body } : {})
      });
      return;
    }
  }

  // If method not allowed
  res.setHeader('Allow', 'GET, POST, OPTIONS');
  res.status(405).end('Method Not Allowed');
}