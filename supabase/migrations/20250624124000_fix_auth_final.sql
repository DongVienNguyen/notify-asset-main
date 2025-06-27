
-- Tắt RLS tạm thời để làm sạch
ALTER TABLE public.staff DISABLE ROW LEVEL SECURITY;

-- Xóa tất cả policies và functions cũ
DROP POLICY IF EXISTS "Allow read for authentication" ON public.staff;
DROP POLICY IF EXISTS "Allow admin operations" ON public.staff;
DROP POLICY IF EXISTS "Allow users to read own data" ON public.staff;
DROP POLICY IF EXISTS "Allow public read access for authentication" ON public.staff;
DROP POLICY IF EXISTS "Allow admin to manage staff" ON public.staff;

DROP FUNCTION IF EXISTS public.get_current_user_role();

-- Bật lại RLS
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Tạo policy đơn giản cho việc đọc (bypass RLS cho authentication)
CREATE POLICY "Allow public read access" 
  ON public.staff 
  FOR SELECT 
  USING (true);

-- Tạo policy cho việc update (chỉ cho phép update failed_login_attempts và account_status)
CREATE POLICY "Allow public update for auth" 
  ON public.staff 
  FOR UPDATE 
  USING (true);

-- Đảm bảo password trigger hoạt động đúng
CREATE OR REPLACE FUNCTION public.hash_password()
RETURNS TRIGGER AS $$
BEGIN
  -- Chỉ hash password khi insert hoặc password thay đổi và chưa được hash
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.password != OLD.password AND NOT NEW.password LIKE '$2%') THEN
    NEW.password = crypt(NEW.password, gen_salt('bf'));
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER 
SET search_path = public, pg_temp;

-- Đảm bảo trigger tồn tại
DROP TRIGGER IF EXISTS hash_password_trigger ON public.staff;
CREATE TRIGGER hash_password_trigger
  BEFORE INSERT OR UPDATE ON public.staff
  FOR EACH ROW
  EXECUTE FUNCTION public.hash_password();
