// routes/translations.js - API routes for handling translations

import express from 'express';
import { executeQuery } from '../utils/db-utils.js';

const router = express.Router();

/**
 * @route   GET /translations/:namespace
 * @desc    Get translations by namespace and locale
 * @access  Public
 */
router.get('/:namespace', async (req, res) => {
  const { namespace } = req.params;
  const locale = req.query.locale || 'he';
  
  try {
    const result = await executeQuery(
      'SELECT key, value FROM translations WHERE namespace = $1 AND locale = $2',
      [namespace, locale]
    );
    
    // Transform array of rows to object
    const translations = {};
    result.rows.forEach(row => {
      translations[row.key] = row.value;
    });
    
    res.json(translations);
  } catch (error) {
    console.error('Error fetching translations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
