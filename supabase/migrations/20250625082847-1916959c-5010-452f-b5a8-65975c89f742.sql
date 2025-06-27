
-- Sửa function get_current_user_info với search_path an toàn
CREATE OR REPLACE FUNCTION public.get_current_user_info()
RETURNS TABLE(username text, role text, department text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- This function will need to be called with proper context from the application
  -- For now, we'll return the user info based on the current session
  -- This should be updated to work with your custom auth system
  RETURN QUERY
  SELECT s.username, s.role, s.department
  FROM public.staff s
  WHERE s.username = current_setting('app.current_user', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT NULL::TEXT, 'user'::TEXT, NULL::TEXT;
END;
$$;

-- Sửa function is_current_user_admin với search_path an toàn
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN (SELECT role FROM public.get_current_user_info()) = 'admin';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Sửa function get_current_username với search_path an toàn
CREATE OR REPLACE FUNCTION public.get_current_username()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN (SELECT username FROM public.get_current_user_info());
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

-- Sửa function set_config với search_path an toàn
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

-- Sửa function get_current_user_role với search_path an toàn
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
