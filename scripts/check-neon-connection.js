require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function checkNeonConnection() {
  console.log('Checking Neon database connection...');
  console.log('DATABASE_URL:', process.env.WDATABASE_URL ? 
    process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@') : 'Not set');
  
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL is not set in your environment variables.');
    console.error('Please ensure your .env file has a valid DATABASE_URL.');
    return;
  }
  
  try {
    const sql = neon(process.env.DATABASE_URL);
    const result = await sql.query('SELECT NOW() as current_time');
    console.log('Connection successful!');
    console.log('Current time from Neon database:', result.rows[0].current_time);
    
    // List all tables
    const tablesResult = await sql.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    console.log('\nTables in Neon database:');
    tablesResult.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
  } catch (error) {
    console.error('Connection failed:', error.message);
    console.error('Please check your Neon database connection string.');
  }
}

checkNeonConnection().catch(err => console.error('Unhandled error:', err));
