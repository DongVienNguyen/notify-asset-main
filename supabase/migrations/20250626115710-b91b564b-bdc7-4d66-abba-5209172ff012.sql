
-- Drop all existing restrictive policies for non-critical tables
-- (keeping asset_transactions and staff secure)

-- Other Assets table
DROP POLICY IF EXISTS "NQ and admin can manage other_assets" ON public.other_assets;
DROP POLICY IF EXISTS "Allow all operations on other_assets" ON public.other_assets;

-- Notifications table  
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;

-- Asset History Archive table
DROP POLICY IF EXISTS "NQ and admin can view asset history" ON public.asset_history_archive;

-- Asset Reminders table
DROP POLICY IF EXISTS "NQ and admin can manage asset_reminders" ON public.asset_reminders;

-- Sent Asset Reminders table
DROP POLICY IF EXISTS "NQ and admin can manage sent_asset_reminders" ON public.sent_asset_reminders;

-- Staff list tables (cbqln, cbkh)
DROP POLICY IF EXISTS "Admin can manage cbqln" ON public.cbqln;
DROP POLICY IF EXISTS "Admin can manage cbkh" ON public.cbkh;

-- Create completely open policies for all non-critical tables
CREATE POLICY "Allow all operations on other_assets" 
  ON public.other_assets 
  FOR ALL 
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on notifications" 
  ON public.notifications 
  FOR ALL 
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on asset_history_archive" 
  ON public.asset_history_archive 
  FOR ALL 
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on asset_reminders" 
  ON public.asset_reminders 
  FOR ALL 
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on sent_asset_reminders" 
  ON public.sent_asset_reminders 
  FOR ALL 
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on cbqln" 
  ON public.cbqln 
  FOR ALL 
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on cbkh" 
  ON public.cbkh 
  FOR ALL 
  TO public
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is still enabled but with open policies
ALTER TABLE public.other_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_history_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sent_asset_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbqln ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbkh ENABLE ROW LEVEL SECURITY;

-- Note: asset_transactions and staff tables keep their existing secure policies
