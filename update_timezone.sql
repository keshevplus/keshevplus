-- Check if date_received is already timestamp with time zone
DO $$ 
DECLARE
    column_data_type text;
BEGIN
    SELECT data_type INTO column_data_type
    FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'date_received';
    
    IF column_data_type = 'timestamp without time zone' THEN
        -- Alter the column to use timestamp with time zone
        ALTER TABLE leads 
        ALTER COLUMN date_received TYPE timestamp with time zone 
        USING date_received AT TIME ZONE 'Asia/Jerusalem';
        
        RAISE NOTICE 'Column date_received updated to timestamp with time zone';
    ELSIF column_data_type = 'timestamp with time zone' THEN
        RAISE NOTICE 'Column date_received is already timestamp with time zone';
    ELSE
        RAISE NOTICE 'Column date_received has unexpected data type: %', column_data_type;
    END IF;
END $$;

-- Set the session timezone to Israel
SET timezone = 'Asia/Jerusalem';

-- Check current timezone setting
SELECT current_setting('TIMEZONE');

-- Show a sample conversion
SELECT 
    NOW() AS current_timestamp,
    NOW() AT TIME ZONE 'UTC' AS utc_time,
    NOW() AT TIME ZONE 'Asia/Jerusalem' AS israel_time;
