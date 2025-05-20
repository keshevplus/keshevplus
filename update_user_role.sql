-- Update user roles from 'db_owner' to 'admin'
UPDATE users
SET role = 'admin'
WHERE role = 'db_owner';

-- Verify the changes
SELECT user_id, username, email, role
FROM users
WHERE role = 'admin';
