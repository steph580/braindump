-- Make ensure_email_verified safe for system operations
CREATE OR REPLACE FUNCTION public.ensure_email_verified()
RETURNS TRIGGER AS $$
BEGIN
  -- Bypass for system/trigger operations without an authenticated user
  IF auth.uid() IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Enforce verified email for authenticated users
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

-- Remove the profiles trigger; we only enforce on user-generated content
DROP TRIGGER IF EXISTS ensure_email_verified_before_profile_operations ON public.profiles;