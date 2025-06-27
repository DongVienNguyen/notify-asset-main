
-- Create sent_crc_reminders table if not exists
CREATE TABLE IF NOT EXISTS public.sent_crc_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loai_bt_crc TEXT NOT NULL,
  ngay_thuc_hien TEXT NOT NULL,
  ldpcrc TEXT,
  cbcrc TEXT,
  quycrc TEXT,
  is_sent BOOLEAN DEFAULT true,
  sent_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create policy for sent_crc_reminders table to allow full access
DROP POLICY IF EXISTS "Enable all access for sent_crc_reminders" ON public.sent_crc_reminders;

CREATE POLICY "Enable all access for sent_crc_reminders" 
ON public.sent_crc_reminders 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Also ensure crc_reminders has full access policy
DROP POLICY IF EXISTS "Enable all access for crc_reminders" ON public.crc_reminders;

CREATE POLICY "Enable all access for crc_reminders" 
ON public.crc_reminders 
FOR ALL 
USING (true) 
WITH CHECK (true);
