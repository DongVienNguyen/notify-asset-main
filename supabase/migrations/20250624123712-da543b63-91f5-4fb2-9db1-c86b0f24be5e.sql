
-- Xóa tất cả policies hiện tại
DROP POLICY IF EXISTS "Allow public read access for authentication" ON public.staff;
DROP POLICY IF EXISTS "Allow admin to manage staff" ON public.staff;

-- Tạo security definer function để lấy role của user hiện tại
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Lấy username từ JWT claims
  SELECT role INTO user_role
  FROM public.staff 
  WHERE username = current_setting('request.jwt.claims', true)::json->>'username';
  
  RETURN COALESCE(user_role, 'user');
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'user';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Tạo policy đơn giản cho việc đọc (cho authentication)
CREATE POLICY "Allow read for authentication" 
  ON public.staff 
  FOR SELECT 
  USING (true);

-- Tạo policy cho admin sử dụng security definer function
CREATE POLICY "Allow admin operations" 
  ON public.staff 
  FOR ALL 
  USING (public.get_current_user_role() = 'admin');

-- Tạo policy cho user chỉ được đọc thông tin của chính họ
CREATE POLICY "Allow users to read own data" 
  ON public.staff 
  FOR SELECT 
  USING (username = current_setting('request.jwt.claims', true)::json->>'username' OR public.get_current_user_role() = 'admin');
