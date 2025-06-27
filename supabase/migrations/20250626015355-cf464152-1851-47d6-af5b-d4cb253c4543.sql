
-- First, let's completely clean up the asset_reminders policies
DROP POLICY IF EXISTS "Allow authenticated users to manage asset reminders" ON public.asset_reminders;
DROP POLICY IF EXISTS "Allow NQ and admin to manage asset reminders" ON public.asset_reminders;
DROP POLICY IF EXISTS "Admin can do everything on asset_reminders" ON public.asset_reminders;

-- Create a completely open policy for testing
CREATE POLICY "Enable all access for asset_reminders" 
ON public.asset_reminders 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Also ensure CRC reminders has similar access for consistency
DROP POLICY IF EXISTS "Allow NQ and admin to manage crc reminders" ON public.crc_reminders;
CREATE POLICY "Enable all access for crc_reminders" 
ON public.crc_reminders 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Make sure staff tables are readable
DROP POLICY IF EXISTS "Allow authenticated users to read cbqln" ON public.cbqln;
DROP POLICY IF EXISTS "Allow authenticated users to read cbkh" ON public.cbkh;

CREATE POLICY "Enable read access for cbqln" 
ON public.cbqln 
FOR SELECT 
USING (true);

CREATE POLICY "Enable read access for cbkh" 
ON public.cbkh 
FOR SELECT 
USING (true);
