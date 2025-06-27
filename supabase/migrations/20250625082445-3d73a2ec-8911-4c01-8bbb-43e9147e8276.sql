
-- Xóa policy cũ nếu có
DROP POLICY IF EXISTS "Allow insert and select on asset_transactions" ON public.asset_transactions;
DROP POLICY IF EXISTS "Allow public access to asset_transactions" ON public.asset_transactions;

-- Tạo policy mới cho phép tất cả các thao tác mà không cần authentication
CREATE POLICY "Allow all operations on asset_transactions" 
  ON public.asset_transactions 
  FOR ALL 
  TO public
  USING (true)
  WITH CHECK (true);

-- Đảm bảo RLS được bật
ALTER TABLE public.asset_transactions ENABLE ROW LEVEL SECURITY;
