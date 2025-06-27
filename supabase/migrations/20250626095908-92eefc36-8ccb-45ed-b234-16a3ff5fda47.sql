
-- Drop all existing policies from all tables first
DO $$ 
BEGIN
    -- Drop all policies from staff table
    DROP POLICY IF EXISTS "Users can read own data" ON public.staff;
    DROP POLICY IF EXISTS "Admins can manage all staff" ON public.staff;
    DROP POLICY IF EXISTS "Allow public read access" ON public.staff;
    DROP POLICY IF EXISTS "Allow public update for auth" ON public.staff;
    DROP POLICY IF EXISTS "Allow read for authentication" ON public.staff;
    DROP POLICY IF EXISTS "Allow admin operations" ON public.staff;
    DROP POLICY IF EXISTS "Allow users to read own data" ON public.staff;

    -- Drop all policies from other_assets table
    DROP POLICY IF EXISTS "NQ and admin can manage other_assets" ON public.other_assets;
    DROP POLICY IF EXISTS "Allow all operations on other_assets" ON public.other_assets;

    -- Drop all policies from asset_transactions table
    DROP POLICY IF EXISTS "Users can view all transactions" ON public.asset_transactions;
    DROP POLICY IF EXISTS "Users can insert own transactions" ON public.asset_transactions;
    DROP POLICY IF EXISTS "Admins can manage all transactions" ON public.asset_transactions;
    DROP POLICY IF EXISTS "Admins can delete transactions" ON public.asset_transactions;
    DROP POLICY IF EXISTS "Allow all operations on asset_transactions" ON public.asset_transactions;

    -- Drop all policies from notifications table
    DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
    DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
    DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;

    -- Drop all policies from asset_history_archive table
    DROP POLICY IF EXISTS "NQ and admin can view asset history" ON public.asset_history_archive;

    -- Drop all policies from reminder tables
    DROP POLICY IF EXISTS "NQ and admin can manage asset_reminders" ON public.asset_reminders;
    DROP POLICY IF EXISTS "NQ and admin can manage crc_reminders" ON public.crc_reminders;
    DROP POLICY IF EXISTS "NQ and admin can manage sent_crc_reminders" ON public.sent_crc_reminders;
    DROP POLICY IF EXISTS "Allow all operations on sent_crc_reminders" ON public.sent_crc_reminders;
    DROP POLICY IF EXISTS "Allow all operations on crc_reminders" ON public.crc_reminders;

    -- Drop all policies from staff list tables
    DROP POLICY IF EXISTS "Admin can manage ldpcrc" ON public.ldpcrc;
    DROP POLICY IF EXISTS "Admin can manage cbcrc" ON public.cbcrc;
    DROP POLICY IF EXISTS "Admin can manage quycrc" ON public.quycrc;
    DROP POLICY IF EXISTS "Admin can manage cbqln" ON public.cbqln;
    DROP POLICY IF EXISTS "Admin can manage cbkh" ON public.cbkh;
    DROP POLICY IF EXISTS "Allow all operations on ldpcrc" ON public.ldpcrc;
    DROP POLICY IF EXISTS "Allow all operations on cbcrc" ON public.cbcrc;
    DROP POLICY IF EXISTS "Allow all operations on quycrc" ON public.quycrc;

EXCEPTION
    WHEN OTHERS THEN
        -- Continue even if some policies don't exist
        NULL;
END $$;

-- Now create secure RLS policies for staff table
CREATE POLICY "Users can read own data" 
  ON public.staff 
  FOR SELECT 
  USING (username = current_setting('app.current_user', true));

CREATE POLICY "Admins can manage all staff" 
  ON public.staff 
  FOR ALL 
  USING (public.is_admin());

-- Create secure RLS policies for other_assets (only NQ department and admins)
CREATE POLICY "NQ and admin can manage other_assets" 
  ON public.other_assets 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE username = current_setting('app.current_user', true) 
      AND (department = 'NQ' OR role = 'admin')
    )
  );

-- Create secure RLS policies for asset_transactions
CREATE POLICY "Users can view all transactions" 
  ON public.asset_transactions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE username = current_setting('app.current_user', true)
    )
  );

CREATE POLICY "Users can insert own transactions" 
  ON public.asset_transactions 
  FOR INSERT 
  WITH CHECK (
    staff_code = current_setting('app.current_user', true) AND
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE username = current_setting('app.current_user', true)
    )
  );

CREATE POLICY "Admins can manage all transactions" 
  ON public.asset_transactions 
  FOR UPDATE 
  USING (public.is_admin());

CREATE POLICY "Admins can delete transactions" 
  ON public.asset_transactions 
  FOR DELETE 
  USING (public.is_admin());

-- Create secure RLS policies for notifications (users only see their own)
CREATE POLICY "Users can view own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (recipient_username = current_setting('app.current_user', true));

CREATE POLICY "Users can update own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (recipient_username = current_setting('app.current_user', true));

CREATE POLICY "Admins can manage all notifications" 
  ON public.notifications 
  FOR ALL 
  USING (public.is_admin());

-- Create secure RLS policies for asset_history_archive (only admins and NQ)
CREATE POLICY "NQ and admin can view asset history" 
  ON public.asset_history_archive 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE username = current_setting('app.current_user', true) 
      AND (department = 'NQ' OR role = 'admin')
    )
  );

-- Create secure RLS policies for reminders (only NQ department and admins)
CREATE POLICY "NQ and admin can manage asset_reminders" 
  ON public.asset_reminders 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE username = current_setting('app.current_user', true) 
      AND (department = 'NQ' OR role = 'admin')
    )
  );

CREATE POLICY "NQ and admin can manage crc_reminders" 
  ON public.crc_reminders 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE username = current_setting('app.current_user', true) 
      AND (department = 'NQ' OR role = 'admin')
    )
  );

CREATE POLICY "NQ and admin can manage sent_crc_reminders" 
  ON public.sent_crc_reminders 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE username = current_setting('app.current_user', true) 
      AND (department = 'NQ' OR role = 'admin')
    )
  );

-- Create secure RLS policies for staff lists (only admins)
CREATE POLICY "Admin can manage ldpcrc" 
  ON public.ldpcrc 
  FOR ALL 
  USING (public.is_admin());

CREATE POLICY "Admin can manage cbcrc" 
  ON public.cbcrc 
  FOR ALL 
  USING (public.is_admin());

CREATE POLICY "Admin can manage quycrc" 
  ON public.quycrc 
  FOR ALL 
  USING (public.is_admin());

CREATE POLICY "Admin can manage cbqln" 
  ON public.cbqln 
  FOR ALL 
  USING (public.is_admin());

CREATE POLICY "Admin can manage cbkh" 
  ON public.cbkh 
  FOR ALL 
  USING (public.is_admin());

-- Ensure all tables have RLS enabled
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.other_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_history_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crc_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sent_crc_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sent_asset_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ldpcrc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbcrc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quycrc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbqln ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbkh ENABLE ROW LEVEL SECURITY;
