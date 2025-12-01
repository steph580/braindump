-- Fix function search path security warnings
CREATE OR REPLACE FUNCTION public.reset_daily_dump_count()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles 
  SET daily_dump_count = 0, last_dump_date = CURRENT_DATE
  WHERE last_dump_date < CURRENT_DATE OR last_dump_date IS NULL;
END;
$$;

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
  
  -- Get user profile
  SELECT * INTO profile_record
  FROM public.profiles 
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    -- Create profile if it doesn't exist
    INSERT INTO public.profiles (user_id) VALUES (p_user_id);
    can_dump := true;
    remaining_dumps := 1;
  ELSIF profile_record.subscription_status = 'premium' THEN
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
  
  -- If can dump, increment counter
  IF can_dump AND remaining_dumps != -1 THEN
    UPDATE public.profiles 
    SET daily_dump_count = CASE 
      WHEN last_dump_date = CURRENT_DATE THEN daily_dump_count + 1
      ELSE 1
    END,
    last_dump_date = CURRENT_DATE
    WHERE user_id = p_user_id;
  END IF;
  
  RETURN jsonb_build_object(
    'can_dump', can_dump,
    'remaining_dumps', remaining_dumps,
    'is_premium', profile_record.subscription_status = 'premium'
  );
END;
$$;