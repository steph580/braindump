-- Fix the security definer function by setting proper search path
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Add triggers to ensure email verification before creating brain dumps
CREATE TRIGGER ensure_email_verified_before_brain_dump_insert
  BEFORE INSERT ON public.brain_dumps
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_email_verified();

-- Also add trigger for profiles to ensure verified users only
CREATE TRIGGER ensure_email_verified_before_profile_operations
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_email_verified();