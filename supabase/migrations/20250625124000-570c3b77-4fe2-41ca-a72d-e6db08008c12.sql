
-- Drop existing problematic policies first
DROP POLICY IF EXISTS "Admin can do everything on staff" ON public.staff;
DROP POLICY IF EXISTS "Admin can do everything on asset_reminders" ON public.asset_reminders;
DROP POLICY IF EXISTS "Admin can do everything on crc_reminders" ON public.crc_reminders;
DROP POLICY IF EXISTS "Admin can do everything on notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admin can do everything on other_assets" ON public.other_assets;
DROP POLICY IF EXISTS "Admin can do everything on cbqln" ON public.cbqln;
DROP POLICY IF EXISTS "Admin can do everything on cbkh" ON public.cbkh;
DROP POLICY IF EXISTS "Admin can do everything on ldpcrc" ON public.ldpcrc;
DROP POLICY IF EXISTS "Admin can do everything on cbcrc" ON public.cbcrc;
DROP POLICY IF EXISTS "Admin can do everything on quycrc" ON public.quycrc;

-- Create security definer function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
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

-- Create new policies using the security definer function
CREATE POLICY "Admin can do everything on staff" 
ON public.staff 
FOR ALL 
USING (public.is_admin());

CREATE POLICY "Admin can do everything on asset_reminders" 
ON public.asset_reminders 
FOR ALL 
USING (public.is_admin());

CREATE POLICY "Admin can do everything on crc_reminders" 
ON public.crc_reminders 
FOR ALL 
USING (public.is_admin());

CREATE POLICY "Admin can do everything on notifications" 
ON public.notifications 
FOR ALL 
USING (public.is_admin());

CREATE POLICY "Admin can do everything on other_assets" 
ON public.other_assets 
FOR ALL 
USING (public.is_admin());

CREATE POLICY "Admin can do everything on cbqln" 
ON public.cbqln 
FOR ALL 
USING (public.is_admin());

CREATE POLICY "Admin can do everything on cbkh" 
ON public.cbkh 
FOR ALL 
USING (public.is_admin());

CREATE POLICY "Admin can do everything on ldpcrc" 
ON public.ldpcrc 
FOR ALL 
USING (public.is_admin());

CREATE POLICY "Admin can do everything on cbcrc" 
ON public.cbcrc 
FOR ALL 
USING (public.is_admin());

CREATE POLICY "Admin can do everything on quycrc" 
ON public.quycrc 
FOR ALL 
USING (public.is_admin());

-- Also add policy for asset_transactions if not exists
CREATE POLICY "Admin can do everything on asset_transactions" 
ON public.asset_transactions 
FOR ALL 
USING (public.is_admin());
