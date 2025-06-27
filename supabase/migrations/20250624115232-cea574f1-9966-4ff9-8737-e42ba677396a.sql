
-- Bảng staff để quản lý nhân viên
CREATE TABLE public.staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  staff_name TEXT,
  role TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  department TEXT,
  account_status TEXT CHECK (account_status IN ('active', 'locked')) DEFAULT 'active',
  failed_login_attempts INTEGER DEFAULT 0,
  last_failed_login TIMESTAMPTZ,
  locked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Bảng asset_transactions để lưu các giao dịch tài sản
CREATE TABLE public.asset_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  staff_code TEXT NOT NULL,
  transaction_date DATE NOT NULL,
  parts_day TEXT NOT NULL,
  room TEXT NOT NULL,
  transaction_type TEXT NOT NULL,
  asset_year INTEGER NOT NULL,
  asset_code INTEGER NOT NULL,
  note TEXT,
  FOREIGN KEY (staff_code) REFERENCES staff(username) ON DELETE CASCADE
);

-- Bảng asset_reminders để quản lý nhắc nhở tài sản
CREATE TABLE public.asset_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ten_ts TEXT NOT NULL,
  ngay_den_han TEXT NOT NULL, -- format 'dd-MM'
  cbqln TEXT,
  cbkh TEXT,
  is_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bảng sent_asset_reminders để lưu lịch sử đã gửi
CREATE TABLE public.sent_asset_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ten_ts TEXT NOT NULL,
  ngay_den_han TEXT NOT NULL,
  cbqln TEXT,
  cbkh TEXT,
  is_sent BOOLEAN DEFAULT false,
  sent_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bảng crc_reminders để quản lý nhắc nhở CRC
CREATE TABLE public.crc_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loai_bt_crc TEXT NOT NULL,
  ngay_thuc_hien TEXT NOT NULL, -- format 'dd-MM'
  ldpcrc TEXT,
  cbcrc TEXT,
  quycrc TEXT,
  is_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bảng sent_crc_reminders để lưu lịch sử đã gửi
CREATE TABLE public.sent_crc_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loai_bt_crc TEXT NOT NULL,
  ngay_thuc_hien TEXT NOT NULL,
  ldpcrc TEXT,
  cbcrc TEXT,
  quycrc TEXT,
  is_sent BOOLEAN DEFAULT false,
  sent_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bảng other_assets để quản lý tài sản khác
CREATE TABLE public.other_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  deposit_date DATE,
  depositor TEXT,
  deposit_receiver TEXT,
  withdrawal_date DATE,
  withdrawal_deliverer TEXT,
  withdrawal_receiver TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Bảng other_asset_histories để lưu lịch sử thay đổi
CREATE TABLE public.other_asset_histories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID NOT NULL,
  asset_name TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  changed_by TEXT NOT NULL,
  change_type TEXT CHECK (change_type IN ('update', 'delete')) NOT NULL,
  change_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (asset_id) REFERENCES other_assets(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES staff(username)
);

-- Bảng notifications để quản lý thông báo
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_username TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  related_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (recipient_username) REFERENCES staff(username) ON DELETE CASCADE
);

-- Các bảng danh sách nhân viên
CREATE TABLE public.cbqln (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ten_nv TEXT NOT NULL,
  email TEXT NOT NULL
);

CREATE TABLE public.cbkh (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ten_nv TEXT NOT NULL,
  email TEXT NOT NULL
);

CREATE TABLE public.ldpcrc (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ten_nv TEXT NOT NULL,
  email TEXT NOT NULL
);

CREATE TABLE public.cbcrc (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ten_nv TEXT NOT NULL,
  email TEXT NOT NULL
);

CREATE TABLE public.quycrc (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ten_nv TEXT NOT NULL,
  email TEXT NOT NULL
);

-- Thêm RLS (Row Level Security) cho các bảng
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sent_asset_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crc_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sent_crc_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.other_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.other_asset_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbqln ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbkh ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ldpcrc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbcrc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quycrc ENABLE ROW LEVEL SECURITY;

-- Tạo policies cho bảng staff (chỉ admin mới có thể quản lý)
CREATE POLICY "Allow read access to all authenticated users" 
  ON public.staff FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow admin to manage staff" 
  ON public.staff FOR ALL 
  TO authenticated 
  USING ((SELECT role FROM public.staff WHERE username = current_setting('request.jwt.claims', true)::json->>'username') = 'admin');

-- Tạo policies cho bảng asset_transactions
CREATE POLICY "Allow users to view all transactions" 
  ON public.asset_transactions FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow users to insert their own transactions" 
  ON public.asset_transactions FOR INSERT 
  TO authenticated 
  WITH CHECK (staff_code = current_setting('request.jwt.claims', true)::json->>'username');

CREATE POLICY "Allow admin to manage all transactions" 
  ON public.asset_transactions FOR ALL 
  TO authenticated 
  USING ((SELECT role FROM public.staff WHERE username = current_setting('request.jwt.claims', true)::json->>'username') = 'admin');

-- Tạo policies cho các bảng reminders (chỉ admin và NQ có quyền quản lý)
CREATE POLICY "Allow NQ and admin to manage asset reminders" 
  ON public.asset_reminders FOR ALL 
  TO authenticated 
  USING ((SELECT department FROM public.staff WHERE username = current_setting('request.jwt.claims', true)::json->>'username') IN ('NQ') 
         OR (SELECT role FROM public.staff WHERE username = current_setting('request.jwt.claims', true)::json->>'username') = 'admin');

CREATE POLICY "Allow NQ and admin to manage sent asset reminders" 
  ON public.sent_asset_reminders FOR ALL 
  TO authenticated 
  USING ((SELECT department FROM public.staff WHERE username = current_setting('request.jwt.claims', true)::json->>'username') IN ('NQ') 
         OR (SELECT role FROM public.staff WHERE username = current_setting('request.jwt.claims', true)::json->>'username') = 'admin');

CREATE POLICY "Allow NQ and admin to manage crc reminders" 
  ON public.crc_reminders FOR ALL 
  TO authenticated 
  USING ((SELECT department FROM public.staff WHERE username = current_setting('request.jwt.claims', true)::json->>'username') IN ('NQ') 
         OR (SELECT role FROM public.staff WHERE username = current_setting('request.jwt.claims', true)::json->>'username') = 'admin');

CREATE POLICY "Allow NQ and admin to manage sent crc reminders" 
  ON public.sent_crc_reminders FOR ALL 
  TO authenticated 
  USING ((SELECT department FROM public.staff WHERE username = current_setting('request.jwt.claims', true)::json->>'username') IN ('NQ') 
         OR (SELECT role FROM public.staff WHERE username = current_setting('request.jwt.claims', true)::json->>'username') = 'admin');

-- Tạo policies cho other_assets
CREATE POLICY "Allow NQ and admin to manage other assets" 
  ON public.other_assets FOR ALL 
  TO authenticated 
  USING ((SELECT department FROM public.staff WHERE username = current_setting('request.jwt.claims', true)::json->>'username') IN ('NQ') 
         OR (SELECT role FROM public.staff WHERE username = current_setting('request.jwt.claims', true)::json->>'username') = 'admin');

CREATE POLICY "Allow NQ and admin to view other asset histories" 
  ON public.other_asset_histories FOR SELECT 
  TO authenticated 
  USING ((SELECT department FROM public.staff WHERE username = current_setting('request.jwt.claims', true)::json->>'username') IN ('NQ') 
         OR (SELECT role FROM public.staff WHERE username = current_setting('request.jwt.claims', true)::json->>'username') = 'admin');

-- Tạo policies cho notifications
CREATE POLICY "Allow users to view their own notifications" 
  ON public.notifications FOR SELECT 
  TO authenticated 
  USING (recipient_username = current_setting('request.jwt.claims', true)::json->>'username');

CREATE POLICY "Allow users to update their own notifications" 
  ON public.notifications FOR UPDATE 
  TO authenticated 
  USING (recipient_username = current_setting('request.jwt.claims', true)::json->>'username');

CREATE POLICY "Allow admin to manage all notifications" 
  ON public.notifications FOR ALL 
  TO authenticated 
  USING ((SELECT role FROM public.staff WHERE username = current_setting('request.jwt.claims', true)::json->>'username') = 'admin');

-- Tạo policies cho các bảng danh sách nhân viên (chỉ admin có thể quản lý)
CREATE POLICY "Allow admin to manage cbqln" 
  ON public.cbqln FOR ALL 
  TO authenticated 
  USING ((SELECT role FROM public.staff WHERE username = current_setting('request.jwt.claims', true)::json->>'username') = 'admin');

CREATE POLICY "Allow admin to manage cbkh" 
  ON public.cbkh FOR ALL 
  TO authenticated 
  USING ((SELECT role FROM public.staff WHERE username = current_setting('request.jwt.claims', true)::json->>'username') = 'admin');

CREATE POLICY "Allow admin to manage ldpcrc" 
  ON public.ldpcrc FOR ALL 
  TO authenticated 
  USING ((SELECT role FROM public.staff WHERE username = current_setting('request.jwt.claims', true)::json->>'username') = 'admin');

CREATE POLICY "Allow admin to manage cbcrc" 
  ON public.cbcrc FOR ALL 
  TO authenticated 
  USING ((SELECT role FROM public.staff WHERE username = current_setting('request.jwt.claims', true)::json->>'username') = 'admin');

CREATE POLICY "Allow admin to manage quycrc" 
  ON public.quycrc FOR ALL 
  TO authenticated 
  USING ((SELECT role FROM public.staff WHERE username = current_setting('request.jwt.claims', true)::json->>'username') = 'admin');

-- Thêm dữ liệu mẫu cho staff
INSERT INTO public.staff (username, password, staff_name, role, department) VALUES 
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Quản trị viên', 'admin', 'NQ'),
('user1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nhân viên 1', 'user', 'CMT8'),
('user2', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nhân viên 2', 'user', 'QLN');

-- Tạo function để hash password và auto-update updated_at
CREATE OR REPLACE FUNCTION public.hash_password()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.password != OLD.password) THEN
    NEW.password = crypt(NEW.password, gen_salt('bf'));
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tạo trigger để auto hash password
CREATE TRIGGER hash_password_trigger
  BEFORE INSERT OR UPDATE ON public.staff
  FOR EACH ROW
  EXECUTE FUNCTION public.hash_password();

-- Tạo function để auto update updated_at cho other_assets
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tạo trigger cho other_assets
CREATE TRIGGER update_other_assets_updated_at
  BEFORE UPDATE ON public.other_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
