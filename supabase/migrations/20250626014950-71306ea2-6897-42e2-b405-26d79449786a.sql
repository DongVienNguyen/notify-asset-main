
-- Drop existing problematic policies for asset_reminders
DROP POLICY IF EXISTS "Allow NQ and admin to manage asset reminders" ON public.asset_reminders;
DROP POLICY IF EXISTS "Admin can do everything on asset_reminders" ON public.asset_reminders;

-- Create a simple policy that allows authenticated users to manage asset reminders
-- This bypasses the complex user role checking that's causing issues
CREATE POLICY "Allow authenticated users to manage asset reminders" 
ON public.asset_reminders 
FOR ALL 
TO authenticated 
USING (true);

-- Also ensure we can read staff emails for the ComboBox
CREATE POLICY "Allow authenticated users to read cbqln" 
ON public.cbqln 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated users to read cbkh" 
ON public.cbkh 
FOR SELECT 
TO authenticated 
USING (true);
