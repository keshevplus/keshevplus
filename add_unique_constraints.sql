-- Add unique constraints to users table for email and phone columns

-- First, check for duplicate email addresses
SELECT email, COUNT(*) 
FROM users 
WHERE email IS NOT NULL 
GROUP BY email 
HAVING COUNT(*) > 1;

-- Check for duplicate phone numbers
SELECT phone, COUNT(*) 
FROM users 
WHERE phone IS NOT NULL 
GROUP BY phone 
HAVING COUNT(*) > 1;

-- Now add unique constraints if there are no duplicates
DO $$ 
BEGIN
  -- Add unique constraint for email (if not already exists)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_email_key' AND conrelid = 'users'::regclass
  ) THEN
    -- First ensure all NULL email values are handled (they won't conflict with unique constraint)
    UPDATE users SET email = NULL WHERE email = '';
    
    -- Now add the constraint
    ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
    RAISE NOTICE 'Added unique constraint for email column';
  ELSE
    RAISE NOTICE 'Email unique constraint already exists';
  END IF;

  -- Add unique constraint for phone (if not already exists)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_phone_key' AND conrelid = 'users'::regclass
  ) THEN
    -- First ensure all NULL phone values are handled
    UPDATE users SET phone = NULL WHERE phone = '';
    
    -- Now add the constraint
    ALTER TABLE users ADD CONSTRAINT users_phone_key UNIQUE (phone);
    RAISE NOTICE 'Added unique constraint for phone column';
  ELSE
    RAISE NOTICE 'Phone unique constraint already exists';
  END IF;
END $$;
