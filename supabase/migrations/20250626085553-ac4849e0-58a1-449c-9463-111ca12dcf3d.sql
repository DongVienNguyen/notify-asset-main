
-- Kiểm tra RLS policies hiện tại cho bảng other_asset_histories
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'other_asset_histories';

-- Tạm thời tắt RLS để test
ALTER TABLE public.other_asset_histories DISABLE ROW LEVEL SECURITY;

-- Hoặc nếu muốn giữ RLS, tạo policy mới cho phép admin đọc tất cả
DROP POLICY IF EXISTS "Allow all operations on other_asset_histories" ON public.other_asset_histories;

CREATE POLICY "Allow admin full access to other_asset_histories" 
  ON public.other_asset_histories 
  FOR ALL 
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE username = current_setting('app.current_user', true) 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE username = current_setting('app.current_user', true) 
      AND role = 'admin'
    )
  );

-- Đảm bảo RLS được bật lại
ALTER TABLE public.other_asset_histories ENABLE ROW LEVEL SECURITY;
