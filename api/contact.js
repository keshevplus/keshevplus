import express from 'express';
import axios from 'axios';

const router = express.Router();

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

router.options('/', (req, res) => {
  setCorsHeaders(res);
  res.status(200).end();
});

router.get('/', (req, res) => {
  setCorsHeaders(res);
  res.status(200).json({ message: 'Contact API is available', success: true });
});

router.post('/', async (req, res) => {
  setCorsHeaders(res);
  const errors = getMissingFieldErrors(req.body);
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields',
      errors,
    });
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
    return res.status(200).json({
      success: true,
      message: 'Form submitted successfully',
      data: response.data,
    });
  } catch (error) {
    // Enhanced error logging for debugging
    console.error('Error forwarding to neon leads:', {
      message: error.message,
      stack: error.stack,
      requestData: req.body,
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to submit form',
      error: error.message,
      stack: error.stack,
      requestData: req.body,
    });
  }
});

export default router;