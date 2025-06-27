
-- Drop all existing restrictive policies for CRC tables
DROP POLICY IF EXISTS "Admin can manage ldpcrc" ON public.ldpcrc;
DROP POLICY IF EXISTS "Admin can manage cbcrc" ON public.cbcrc;
DROP POLICY IF EXISTS "Admin can manage quycrc" ON public.quycrc;
DROP POLICY IF EXISTS "NQ and admin can manage crc_reminders" ON public.crc_reminders;
DROP POLICY IF EXISTS "Allow all operations on crc_reminders" ON public.crc_reminders;
DROP POLICY IF EXISTS "Enable all access for crc_reminders" ON public.crc_reminders;
DROP POLICY IF EXISTS "NQ and admin can manage sent_crc_reminders" ON public.sent_crc_reminders;
DROP POLICY IF EXISTS "Allow all operations on sent_crc_reminders" ON public.sent_crc_reminders;
DROP POLICY IF EXISTS "Admin can manage sent_crc_reminders" ON public.sent_crc_reminders;

-- Create completely open policies for all CRC tables
CREATE POLICY "Allow all operations on ldpcrc" 
  ON public.ldpcrc 
  FOR ALL 
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on cbcrc" 
  ON public.cbcrc 
  FOR ALL 
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on quycrc" 
  ON public.quycrc 
  FOR ALL 
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on crc_reminders" 
  ON public.crc_reminders 
  FOR ALL 
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on sent_crc_reminders" 
  ON public.sent_crc_reminders 
  FOR ALL 
  TO public
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled but with open policies
ALTER TABLE public.ldpcrc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbcrc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quycrc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crc_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sent_crc_reminders ENABLE ROW LEVEL SECURITY;
