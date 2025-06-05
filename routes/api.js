import express from 'express';
import { executeQuery, executeTransaction } from '../utils/db-utils.js';

const router = express.Router();

// Example API endpoint to fetch data
router.get('/messages', async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM messages LIMIT 10');
    res.json(result.rows);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Example endpoint to get a single record by ID
router.get('/messages/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await executeQuery('SELECT * FROM your_table WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Example endpoint to create a new record
router.post('/messages', async (req, res) => {
  const { field1, field2, field3 } = req.body;
  
  try {
    const result = await executeQuery(
      'INSERT INTO messages (field1, field2, field3) VALUES ($1, $2, $3) RETURNING *',
      [field1, field2, field3]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add more API endpoints as needed

export default router;
