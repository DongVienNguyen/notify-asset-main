
-- Kiểm tra và tạo policy cho bảng other_asset_histories
DROP POLICY IF EXISTS "Allow all operations on other_asset_histories" ON public.other_asset_histories;

-- Tạo policy mới cho phép tất cả các thao tác trên bảng other_asset_histories
CREATE POLICY "Allow all operations on other_asset_histories" 
  ON public.other_asset_histories 
  FOR ALL 
  TO public
  USING (true)
  WITH CHECK (true);

-- Đảm bảo RLS được bật cho bảng other_asset_histories
ALTER TABLE public.other_asset_histories ENABLE ROW LEVEL SECURITY;
