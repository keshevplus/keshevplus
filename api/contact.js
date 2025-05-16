import axios from 'axios';
import { sendLeadNotification, sendLeadAcknowledgment } from '../utils/mailer.js';
// Added mailer import for sending notification and acknowledgment emails

// CORS setup: You can allow multiple origins by checking req.headers.origin and conditionally setting the header
// List of allowed origins for CORS
// Allowlist of explicit origins
const allowedOrigins = [
  'https://keshevplus.co.il',
  'https://www.keshevplus.co.il',
  'https://api.keshevplus.co.il',
  'https://api.keshevplus.co.il/api',
];

// Allow *.vercel.app origins for CORS
function isVercelAppOrigin(origin) {
  try {
    const url = new URL(origin);
    return url.hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || isVercelAppOrigin(origin)) {
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
    console.log('[ContactAPI] Incoming request');
    // Vercel: body may not be parsed automatically
    if (!body || typeof body !== 'object') {
      try {
        let raw = '';
        for await (const chunk of req) { raw += chunk; }
        body = JSON.parse(raw);
        console.log('[ContactAPI] Parsed raw JSON body:', body);
      } catch (e) {
        console.error('[ContactAPI] Failed to parse JSON body:', e, { rawBody: typeof raw !== 'undefined' ? raw : undefined });
        res.status(400).json({ success: false, message: 'Invalid JSON body', error: e.message });
        return;
      }
    }

    console.log('[ContactAPI] Validating required fields...');
    const errors = getMissingFieldErrors(body);
    if (errors.length > 0) {
      console.warn('[ContactAPI] Missing required fields:', errors, { body });
      res.status(400).json({
        success: false,
        message: 'Missing required fields',
        errors,
      });
      return;
    }
    try {
      console.log('[ContactAPI] Posting to /neon/leads...', { body });
      const baseUrl = getBaseUrl();
      const response = await axios({
        method: 'post',
        url: `${baseUrl}/neon/leads`,
        data: body,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('[ContactAPI] /neon/leads response:', response.status, response.data);
      // After successful lead creation, send notification and acknowledgment emails
      let notificationResult = false;
      let acknowledgmentResult = false;
      try {
        console.log('[ContactAPI] Sending admin notification email...');
        notificationResult = await sendLeadNotification(body);
        console.log('[ContactAPI] Admin notification email result:', notificationResult);
      } catch (err) {
        console.error('[ContactAPI] Failed to send admin notification email:', err, { body });
      }
      try {
        console.log('[ContactAPI] Sending acknowledgment email to lead...');
        acknowledgmentResult = await sendLeadAcknowledgment(body);
        console.log('[ContactAPI] Acknowledgment email result:', acknowledgmentResult);
      } catch (err) {
        console.error('[ContactAPI] Failed to send acknowledgment email to lead:', err, { body });
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
      // Log error server-side with stack and request body
      console.error('[ContactAPI] Error in POST handler:', {
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