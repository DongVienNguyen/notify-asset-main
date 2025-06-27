
-- Xóa policy cũ nếu có
DROP POLICY IF EXISTS "Allow NQ and admin to manage other assets" ON public.other_assets;

-- Tạo policy mới cho phép tất cả các thao tác mà không cần authentication để test
CREATE POLICY "Allow all operations on other_assets" 
  ON public.other_assets 
  FOR ALL 
  TO public
  USING (true)
  WITH CHECK (true);

-- Đảm bảo RLS được bật
ALTER TABLE public.other_assets ENABLE ROW LEVEL SECURITY;
