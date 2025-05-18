require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function testNeonConnection() {
  console.log('Testing connection to Neon serverless database...');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables');
    return;
  }
  
  console.log(`Connection string: ${process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@')}`);  
  try {
    const sql = neon(process.env.DATABASE_URL);
    const result = await sql`SELECT NOW() as now`;
    console.log('✅ Neon connection successful!');
    console.log(`Current time from database: ${result[0].now}`);
  } catch (error) {
    console.error('❌ Neon connection failed:', error.message);
    console.error('Error details:', error);
  }
} 


testNeonConnection().catch(err => console.error('Unhandled error:', err));
