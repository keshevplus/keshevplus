import axios from 'axios';

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.keshevplus.co.il');
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
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method === 'GET') {
    res.status(200).json({ message: 'Contact API is available', success: true });
    return;
  }
  if (req.method === 'POST') {
    const errors = getMissingFieldErrors(req.body);
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
        data: req.body,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      res.status(200).json({
        success: true,
        message: 'Form submitted successfully',
        data: response.data,
      });
      return;
    } catch (error) {
      // Enhanced error logging for debugging
      console.error('Error forwarding to neon leads:', {
        message: error.message,
        stack: error.stack,
        requestData: req.body,
      });
      res.status(500).json({
        success: false,
        message: 'Failed to submit form',
        error: error.message,
        stack: error.stack,
        requestData: req.body,
      });
      return;
    }
  }
  // If method not allowed
  res.setHeader('Allow', 'GET, POST, OPTIONS');
  res.status(405).end('Method Not Allowed');
}