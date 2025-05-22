import { neon } from '@neondatabase/serverless';

// Use the provided database URL
const databaseUrl = 'postgresql://neondb_owner:npg_tYJvA94QMXLK@ep-icy-forest-a4rpjd22-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(databaseUrl);

async function checkTablesAndCopy() {
  try {
    console.log('Connecting to database...');
    
    // First, check which tables exist and their schema
    console.log('\nChecking available tables:');
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    console.log('\nAvailable tables:');
    tables.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
    // Check schema of messages table
    console.log('\nChecking schema of messages table:');
    const messagesColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'messages'
      ORDER BY ordinal_position;
    `;
    
    console.log('\nMessages table columns:');
    messagesColumns.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type}, ${col.is_nullable === 'YES' ? 'nullable' : 'not nullable'})`);
    });
    
    // Create leads table if it doesn't exist
    console.log('\nCreating leads table if it doesn\'t exist:');
    await sql`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20) NOT NULL,
        subject VARCHAR(255),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Check messages content
    console.log('\nFetching sample from messages table:');
    const messagesCount = await sql`SELECT COUNT(*) as count FROM messages;`;
    console.log(`Total messages: ${messagesCount[0].count}`);
    
    if (parseInt(messagesCount[0].count) > 0) {
      const messageSample = await sql`SELECT * FROM messages LIMIT 1;`;
      console.log('Sample message fields:');
      Object.keys(messageSample[0]).forEach(key => {
        console.log(`- ${key}: ${messageSample[0][key]}`);
      });
      
      // Now copy data from messages to leads
      console.log('\nCopying data from messages to leads...');
      
      // Determine the correct date field name based on what we found
      const dateField = messagesColumns.find(col => 
        col.column_name.includes('date') || 
        col.column_name.includes('time') || 
        col.column_name.includes('created')
      )?.column_name || 'created_at';
      
      console.log(`Using ${dateField} as the date field`);
      
      // Copy the data with the correct column mappings
      const result = await sql`
        INSERT INTO leads (name, email, phone, subject, message, created_at)
        SELECT name, email, phone, subject, message, ${sql.raw(dateField)}
        FROM messages
        ON CONFLICT DO NOTHING;
      `;
      
      console.log(`Copied data: ${result.count} rows affected`);
    } else {
      console.log('No messages to copy.');
    }
    
    // Check leads content after copying
    const leadsCount = await sql`SELECT COUNT(*) as count FROM leads;`;
    console.log(`\nTotal leads after copy: ${leadsCount[0].count}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTablesAndCopy()
  .then(() => {
    console.log('\nOperation completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Operation failed:', error);
    process.exit(1);
  });
