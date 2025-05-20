-- Add user_id column to messages and leads tables

-- First add the column to messages table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'messages' AND column_name = 'user_id') THEN
    ALTER TABLE messages ADD COLUMN user_id INTEGER;
    ALTER TABLE messages ADD CONSTRAINT fk_messages_user 
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL;
    RAISE NOTICE 'Added user_id column to messages table';
  ELSE
    RAISE NOTICE 'user_id column already exists in messages table';
  END IF;
END $$;

-- Then add the column to leads table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'leads' AND column_name = 'user_id') THEN
    ALTER TABLE leads ADD COLUMN user_id INTEGER;
    ALTER TABLE leads ADD CONSTRAINT fk_leads_user 
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL;
    RAISE NOTICE 'Added user_id column to leads table';
  ELSE
    RAISE NOTICE 'user_id column already exists in leads table';
  END IF;
END $$;

-- Create indexes for improved query performance
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                WHERE tablename = 'messages' AND indexname = 'idx_messages_user_id') THEN
    CREATE INDEX idx_messages_user_id ON messages(user_id);
    RAISE NOTICE 'Created index on messages.user_id';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                WHERE tablename = 'leads' AND indexname = 'idx_leads_user_id') THEN
    CREATE INDEX idx_leads_user_id ON leads(user_id);
    RAISE NOTICE 'Created index on leads.user_id';
  END IF;
END $$;

-- Show the updated table schemas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages' 
ORDER BY ordinal_position;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'leads' 
ORDER BY ordinal_position;
