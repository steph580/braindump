-- Enable email confirmation requirement
-- This will prevent users from using the app until they verify their email
-- Note: This is a configuration change, not a database schema change

-- Update auth configuration to require email confirmation
-- This should be done in the Supabase dashboard under Authentication > Settings
-- Set "Enable email confirmations" to true

-- For now, we'll add a database-level check to ensure verified emails
-- Create a function to check if user is verified before allowing data operations
CREATE OR REPLACE FUNCTION public.ensure_email_verified()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the current user has a verified email
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email_confirmed_at IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Email must be verified before performing this action';
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;