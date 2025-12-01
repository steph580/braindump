-- Fix the foreign key constraint issue by removing the problematic constraint
-- and ensuring profiles can be created without requiring auth.users entry

-- First, drop the existing foreign key constraint if it exists
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Update the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, daily_dump_count, last_dump_date)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email, 'User'),
    0,
    NULL
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Update check_daily_limit to ensure profile exists
CREATE OR REPLACE FUNCTION public.check_daily_limit(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  profile_record RECORD;
  can_dump BOOLEAN := false;
  remaining_dumps INTEGER := 0;
BEGIN
  -- Reset daily counts if needed
  PERFORM public.reset_daily_dump_count();
  
  -- Ensure profile exists first
  INSERT INTO public.profiles (user_id, daily_dump_count, last_dump_date, subscription_status) 
  VALUES (p_user_id, 0, NULL, 'free')
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Get user profile
  SELECT * INTO profile_record
  FROM public.profiles 
  WHERE user_id = p_user_id;
  
  IF profile_record.subscription_status = 'premium' THEN
    -- Premium users have unlimited dumps
    can_dump := true;
    remaining_dumps := -1; -- -1 indicates unlimited
  ELSIF profile_record.last_dump_date = CURRENT_DATE THEN
    -- Free user, check today's usage
    IF profile_record.daily_dump_count < 1 THEN
      can_dump := true;
      remaining_dumps := 1 - profile_record.daily_dump_count;
    ELSE
      can_dump := false;
      remaining_dumps := 0;
    END IF;
  ELSE
    -- Free user, new day
    can_dump := true;
    remaining_dumps := 1;
  END IF;
  
  RETURN jsonb_build_object(
    'can_dump', can_dump,
    'remaining_dumps', remaining_dumps,
    'is_premium', profile_record.subscription_status = 'premium'
  );
END;
$$;