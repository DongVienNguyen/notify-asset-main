
-- Sửa RLS policy cho bảng asset_transactions để cho phép insert
DROP POLICY IF EXISTS "Allow public access to asset_transactions" ON public.asset_transactions;

-- Tạo policy mới cho phép insert và select không cần authentication
CREATE POLICY "Allow insert and select on asset_transactions" 
  ON public.asset_transactions 
  FOR ALL 
  TO public
  USING (true)
  WITH CHECK (true);

-- Đảm bảo RLS được bật
ALTER TABLE public.asset_transactions ENABLE ROW LEVEL SECURITY;
