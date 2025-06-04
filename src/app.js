const express = require('express');
const { pool, checkConnection } = require('./db');

const app = express();

// Setup graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  try {
    await pool.end();
    console.log('Database pool has ended');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
});

// Initial connection check
async function initialize() {
  try {
    console.log('Database connected successfully');
    await checkConnection();
  } catch (err) {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  }
}

initialize();

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});