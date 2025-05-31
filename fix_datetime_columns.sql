-- Update datetime columns in both messages and leads tables to use timezone-aware types

-- Set timezone to Israel
SET timezone = 'Asia/Jerusalem';

-- Messages table updates
DO $$ 
BEGIN
    -- Check if created_at column exists and convert it to timestamp with time zone
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'messages' AND column_name = 'created_at') THEN
        ALTER TABLE messages 
        ALTER COLUMN created_at TYPE timestamp with time zone 
        USING created_at AT TIME ZONE 'Asia/Jerusalem';
        
        RAISE NOTICE 'messages.created_at updated to timestamp with time zone';
    END IF;
    
    -- Check if read_at column exists and convert it to timestamp with time zone
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'messages' AND column_name = 'read_at') THEN
        ALTER TABLE messages 
        ALTER COLUMN read_at TYPE timestamp with time zone;
        
        RAISE NOTICE 'messages.read_at updated to timestamp with time zone';
    END IF;
    
    -- Check if sent_at column exists and convert it to timestamp with time zone
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'messages' AND column_name = 'sent_at') THEN
        ALTER TABLE messages 
        ALTER COLUMN sent_at TYPE timestamp with time zone 
        USING sent_at AT TIME ZONE 'Asia/Jerusalem';
        
        RAISE NOTICE 'messages.sent_at updated to timestamp with time zone';
    END IF;
END $$;

-- Leads table updates
DO $$ 
BEGIN
    -- Check if created_at column exists and convert it to timestamp with time zone
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'leads' AND column_name = 'created_at') THEN
        ALTER TABLE leads 
        ALTER COLUMN created_at TYPE timestamp with time zone 
        USING created_at AT TIME ZONE 'Asia/Jerusalem';
        
        RAISE NOTICE 'leads.created_at updated to timestamp with time zone';
    END IF;
    
    -- Check if read_at column exists and convert it to timestamp with time zone
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'leads' AND column_name = 'read_at') THEN
        ALTER TABLE leads 
        ALTER COLUMN read_at TYPE timestamp with time zone;
        
        RAISE NOTICE 'leads.read_at updated to timestamp with time zone';
    END IF;
END $$;

-- Verify the changes
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name IN ('messages', 'leads')
  AND column_name IN ('created_at', 'created_at', 'read_at', 'sent_at')
ORDER BY table_name, column_name;
