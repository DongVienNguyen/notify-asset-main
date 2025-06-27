
-- Fix all functions to have secure search_path
-- Update is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  user_role text;
  current_user_setting text;
BEGIN
  -- Get the current user from the setting
  current_user_setting := current_setting('app.current_user', true);
  
  -- If no user is set, return false
  IF current_user_setting IS NULL OR current_user_setting = '' THEN
    RETURN false;
  END IF;
  
  -- Get the user's role directly from staff table
  SELECT role INTO user_role 
  FROM public.staff 
  WHERE username = current_user_setting;
  
  -- Return true if user is admin
  RETURN COALESCE(user_role = 'admin', false);
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Update get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Lấy username từ JWT claims
  SELECT role INTO user_role
  FROM public.staff 
  WHERE username = current_setting('request.jwt.claims', true)::json->>'username';
  
  RETURN COALESCE(user_role, 'user');
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'user';
END;
$$;

-- Update set_config function
CREATE OR REPLACE FUNCTION public.set_config(setting_name text, new_value text, is_local boolean DEFAULT false)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM set_config(setting_name, new_value, is_local);
  RETURN new_value;
END;
$$;
