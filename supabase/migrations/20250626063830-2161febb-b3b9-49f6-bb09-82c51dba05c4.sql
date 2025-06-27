
-- First, let's check and fix RLS policies for CRC staff tables
-- We need to ensure admin users can manage these tables

-- Drop existing problematic policies if they exist
DROP POLICY IF EXISTS "Admin can do everything on ldpcrc" ON public.ldpcrc;
DROP POLICY IF EXISTS "Admin can do everything on cbcrc" ON public.cbcrc;
DROP POLICY IF EXISTS "Admin can do everything on quycrc" ON public.quycrc;

-- Create comprehensive policies for ldpcrc table
CREATE POLICY "Admin can manage ldpcrc" 
ON public.ldpcrc 
FOR ALL 
USING (
  -- Allow if user is admin (using the security definer function)
  public.is_admin()
);

-- Create comprehensive policies for cbcrc table  
CREATE POLICY "Admin can manage cbcrc" 
ON public.cbcrc 
FOR ALL 
USING (
  -- Allow if user is admin (using the security definer function)
  public.is_admin()
);

-- Create comprehensive policies for quycrc table
CREATE POLICY "Admin can manage quycrc" 
ON public.quycrc 
FOR ALL 
USING (
  -- Allow if user is admin (using the security definer function)
  public.is_admin()
);

-- Also make sure sent_crc_reminders has proper policies
DROP POLICY IF EXISTS "Admin can manage sent_crc_reminders" ON public.sent_crc_reminders;

CREATE POLICY "Admin can manage sent_crc_reminders" 
ON public.sent_crc_reminders 
FOR ALL 
USING (public.is_admin());
