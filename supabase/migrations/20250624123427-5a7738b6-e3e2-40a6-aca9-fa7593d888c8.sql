
-- Bật lại Row Level Security cho bảng staff
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Xóa các policy cũ nếu tồn tại và tạo lại
DROP POLICY IF EXISTS "Allow public read access for authentication" ON public.staff;
DROP POLICY IF EXISTS "Allow admin to manage staff" ON public.staff;

-- Tạo policy cho phép đọc thông tin staff (cần thiết cho login)
CREATE POLICY "Allow public read access for authentication" 
  ON public.staff 
  FOR SELECT 
  USING (true);

-- Tạo policy cho phép admin quản lý staff
CREATE POLICY "Allow admin to manage staff" 
  ON public.staff 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE username = current_setting('request.jwt.claims', true)::json->>'username' 
      AND role = 'admin'
    )
  );

-- Sửa các function để có search_path cố định
CREATE OR REPLACE FUNCTION public.hash_password()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.password != OLD.password) THEN
    NEW.password = crypt(NEW.password, gen_salt('bf'));
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER 
SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SET search_path = public, pg_temp;
