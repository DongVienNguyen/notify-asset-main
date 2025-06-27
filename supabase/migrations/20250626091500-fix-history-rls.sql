
-- Tạm thời tắt RLS để kiểm tra
ALTER TABLE public.other_asset_histories DISABLE ROW LEVEL SECURITY;

-- Hoặc tạo policy cho phép admin xem tất cả
DROP POLICY IF EXISTS "Allow admin access to other_asset_histories" ON public.other_asset_histories;

CREATE POLICY "Allow admin access to other_asset_histories" 
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

-- Bật lại RLS
ALTER TABLE public.other_asset_histories ENABLE ROW LEVEL SECURITY;
