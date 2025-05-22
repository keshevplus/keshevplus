import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Get database URL from environment or use a fallback for testing
const databaseUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tYJvA94QMXLK@ep-icy-forest-a4rpjd22-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';

// Initialize the SQL client
const sql = neon(databaseUrl);

async function setupSyncTrigger() {
  console.log('Setting up automatic sync between messages and leads tables...');
  
  try {
    // 1. First, verify both tables exist
    console.log('Verifying tables...');
    const tablesCheck = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' 
      AND table_name IN ('messages', 'leads')
      ORDER BY table_name;
    `;
    
    if (tablesCheck.length < 2) {
      console.error('Error: Both messages and leads tables must exist!');
      console.log('Found tables:', tablesCheck.map(t => t.table_name).join(', '));
      return;
    }
    
    console.log('✅ Both tables exist:', tablesCheck.map(t => t.table_name).join(', '));
    
    // 2. Create the function that will be called by the trigger
    console.log('Creating sync function...');
    await sql`
      CREATE OR REPLACE FUNCTION sync_message_to_lead()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Insert the new message into leads table
        INSERT INTO leads (name, email, phone, subject, message, date_received)
        VALUES (
          NEW.name,
          NEW.email,
          NEW.phone,
          NEW.subject,
          NEW.message,
          NEW.created_at
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    console.log('✅ Sync function created');
    
    // 3. Check if the trigger already exists to avoid errors
    console.log('Checking for existing trigger...');
    const triggerCheck = await sql`
      SELECT trigger_name
      FROM information_schema.triggers
      WHERE event_object_table = 'messages'
      AND trigger_name = 'messages_to_leads_trigger';
    `;
    
    if (triggerCheck.length > 0) {
      console.log('Dropping existing trigger...');
      await sql`DROP TRIGGER IF EXISTS messages_to_leads_trigger ON messages;`;
    }
    
    // 4. Create the trigger
    console.log('Creating trigger...');
    await sql`
      CREATE TRIGGER messages_to_leads_trigger
      AFTER INSERT ON messages
      FOR EACH ROW
      EXECUTE FUNCTION sync_message_to_lead();
    `;
    
    console.log('✅ Trigger created successfully!');
    
    // 5. Test the trigger with a dummy message (optional - disabled by default)
    /*
    console.log('Testing trigger with a dummy message...');
    const testMessage = await sql`
      INSERT INTO messages (
        name, email, phone, subject, message, created_at
      ) VALUES (
        'Trigger Test', 'test@example.com', '055-1234567', 'Trigger Test',
        'This is a test message to verify the trigger is working.', NOW()
      ) RETURNING id;
    `;
    console.log(`Test message created with ID: ${testMessage[0].id}`);
    
    // Sleep briefly to allow the trigger to fire
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if it was copied to leads
    const leadCheck = await sql`
      SELECT id FROM leads 
      WHERE name = 'Trigger Test' AND email = 'test@example.com'
      ORDER BY date_received DESC LIMIT 1;
    `;
    
    if (leadCheck.length > 0) {
      console.log(`✅ Test successful! Lead created with ID: ${leadCheck[0].id}`);
    } else {
      console.error('❌ Test failed: Lead was not created automatically.');
    }
    */
    
    console.log('\n📝 Summary:');
    console.log('1. Created a PostgreSQL function that copies new messages to leads');
    console.log('2. Created a trigger that runs this function after each message insertion');
    console.log('3. All new messages will now be automatically synchronized to leads');
    
  } catch (error) {
    console.error('Error setting up trigger:', error);
  }
}

// Run the function
setupSyncTrigger()
  .then(() => {
    console.log('\n✨ Setup completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
