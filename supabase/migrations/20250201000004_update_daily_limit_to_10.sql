-- Update daily dump limit from 1 to 10 per day for free users
CREATE OR REPLACE FUNCTION public.check_daily_limit(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  profile_record RECORD;
  can_dump BOOLEAN := false;
  remaining_dumps INTEGER := 0;
  MAX_FREE_DUMPS INTEGER := 10;
BEGIN
  -- Reset daily counts if needed
  PERFORM public.reset_daily_dump_count();
  
  -- Get user profile
  SELECT * INTO profile_record
  FROM public.profiles 
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    -- Create profile if it doesn't exist
    INSERT INTO public.profiles (user_id, daily_dump_count, last_dump_date) 
    VALUES (p_user_id, 0, NULL);
    can_dump := true;
    remaining_dumps := MAX_FREE_DUMPS;
  ELSIF profile_record.subscription_status = 'premium' THEN
    -- Premium users have unlimited dumps
    can_dump := true;
    remaining_dumps := -1;
  ELSIF profile_record.last_dump_date = CURRENT_DATE THEN
    -- Free user, check today's usage
    IF profile_record.daily_dump_count < MAX_FREE_DUMPS THEN
      can_dump := true;
      remaining_dumps := MAX_FREE_DUMPS - profile_record.daily_dump_count;
    ELSE
      can_dump := false;
      remaining_dumps := 0;
    END IF;
  ELSE
    -- Free user, new day
    can_dump := true;
    remaining_dumps := MAX_FREE_DUMPS;
  END IF;
  
  RETURN jsonb_build_object(
    'can_dump', can_dump,
    'remaining_dumps', remaining_dumps
  );
END;
$$;
