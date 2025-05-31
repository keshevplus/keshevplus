-- ALTER TABLE script for updating the messages table structure

-- First, identify the foreign key constraint name (run separately if needed)
-- SELECT conname FROM pg_constraint WHERE conrelid = 'messages'::regclass::oid;

-- Drop the foreign key constraint first
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

-- Rename sender_id to name and change its type to varchar(100)
ALTER TABLE messages ALTER COLUMN sender_id TYPE varchar(100);
ALTER TABLE messages RENAME COLUMN sender_id TO name;

-- Remove recipient_id column
ALTER TABLE messages DROP COLUMN IF EXISTS recipient_id;

-- Rename body to message (if it exists)
DO $$ 
BEGIN
   IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'body') THEN
      ALTER TABLE messages RENAME COLUMN body TO message;
   END IF;
END $$;

-- Add additional columns if needed
DO $$ 
BEGIN
   IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'email') THEN
      ALTER TABLE leads ADD COLUMN email varchar(255);
   END IF;
   
   IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'phone') THEN
      ALTER TABLE leads ADD COLUMN phone varchar(20);
   END IF;
   
   IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'subject') THEN
      ALTER TABLE leads ADD COLUMN subject varchar(255);
   END IF;
   
   -- Check if created_at exists, and if so, rename it to created_at
   IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'created_at') THEN
      ALTER TABLE leads RENAME COLUMN created_at TO created_at;
   -- If it doesn't exist, add created_at directly
   ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'created_at') THEN
      ALTER TABLE leads ADD COLUMN created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP;
   END IF;
   
   IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'read_at') THEN
      ALTER TABLE leads ADD COLUMN read_at timestamp with time zone;
   END IF;
END $$;

-- Confirm changes
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'messages' ORDER BY ordinal_position;
