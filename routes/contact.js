import express from 'express';
const router = express.Router();

router.post('/', async (req, res) => {
  // Example logic
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  // TODO: Save to database, send email, etc.
  res.status(200).json({ success: true, message: 'Contact form submitted' });
});

export default router;