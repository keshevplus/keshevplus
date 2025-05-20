-- Add logged_in column to users table
DO $$ 
BEGIN
   -- Check if the column already exists before adding it
   IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'logged_in') THEN
      ALTER TABLE users ADD COLUMN logged_in BOOLEAN DEFAULT FALSE;
      
      -- Output success message
      RAISE NOTICE 'Column "logged_in" added to users table';
   ELSE
      RAISE NOTICE 'Column "logged_in" already exists in users table';
   END IF;
END $$;
