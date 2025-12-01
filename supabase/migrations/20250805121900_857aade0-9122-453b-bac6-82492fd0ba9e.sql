-- Fix the check_daily_limit function to not increment counter during check
-- The function should only increment when an actual dump is being created

CREATE OR REPLACE FUNCTION public.check_daily_limit(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
    INSERT INTO public.profiles (user_id, daily_dump_count, last_dump_date) 
    VALUES (p_user_id, 0, NULL);
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
  
  -- DO NOT increment counter here - this is just a check
  -- The counter will be incremented by the increment_daily_dump function
  
  RETURN jsonb_build_object(
    'can_dump', can_dump,
    'remaining_dumps', remaining_dumps,
    'is_premium', profile_record.subscription_status = 'premium'
  );
END;
$function$;

-- Create a separate function to increment the dump count
CREATE OR REPLACE FUNCTION public.increment_daily_dump(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Reset daily counts if needed
  PERFORM public.reset_daily_dump_count();
  
  -- Increment the counter
  UPDATE public.profiles 
  SET daily_dump_count = CASE 
    WHEN last_dump_date = CURRENT_DATE THEN daily_dump_count + 1
    ELSE 1
  END,
  last_dump_date = CURRENT_DATE
  WHERE user_id = p_user_id;
  
  -- Create profile if it doesn't exist
  INSERT INTO public.profiles (user_id, daily_dump_count, last_dump_date)
  SELECT p_user_id, 1, CURRENT_DATE
  WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = p_user_id);
END;
$function$;