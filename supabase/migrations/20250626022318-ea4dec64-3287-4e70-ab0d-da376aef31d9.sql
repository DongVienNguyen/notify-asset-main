
-- Create policy for sent_asset_reminders table to allow full access
DROP POLICY IF EXISTS "Enable all access for sent_asset_reminders" ON public.sent_asset_reminders;

CREATE POLICY "Enable all access for sent_asset_reminders" 
ON public.sent_asset_reminders 
FOR ALL 
USING (true) 
WITH CHECK (true);
