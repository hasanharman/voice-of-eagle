DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

ALTER TABLE transfer_rumours 
ADD COLUMN IF NOT EXISTS current_league TEXT;
