import express from 'express';
import { executeQuery } from '../utils/db-utils.js';

const router = express.Router();

/**
 * @route   GET /content/page/:pageKey
 * @desc    Get page content by key and locale
 * @access  Public
 */
router.get('/page/:pageKey', async (req, res) => {
  const { pageKey } = req.params;
  const locale = req.query.locale || 'he';
  
  try {
    const result = await executeQuery(
      'SELECT content_json FROM page_content WHERE page_key = $1 AND locale = $2',
      [pageKey, locale]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Page content for ${pageKey} not found` });
    }
    
    res.json(result.rows[0].content_json);
  } catch (error) {
    console.error('Error fetching page content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route   GET /content/all
 * @desc    Get all pages content
 * @access  Admin only (add middleware)
 */
router.get('/all', async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM page_content');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching all content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
