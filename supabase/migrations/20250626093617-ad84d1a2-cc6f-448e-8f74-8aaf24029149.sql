
-- Tạo bảng lịch sử độc lập hoàn toàn
CREATE TABLE IF NOT EXISTS public.asset_history_archive (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_asset_id uuid NOT NULL, -- Chỉ lưu ID gốc, không tạo foreign key
  asset_name text NOT NULL,
  change_type text NOT NULL,
  changed_by text NOT NULL,
  change_reason text,
  old_data jsonb,
  new_data jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Không tạo foreign key constraint để tránh cascade delete
-- Không enable RLS để admin có thể truy cập được

-- Tạo index để tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_asset_history_archive_original_asset_id 
ON public.asset_history_archive(original_asset_id);

CREATE INDEX IF NOT EXISTS idx_asset_history_archive_created_at 
ON public.asset_history_archive(created_at DESC);

-- Grant permissions
GRANT ALL ON public.asset_history_archive TO authenticated;
GRANT ALL ON public.asset_history_archive TO anon;

-- Copy existing data from other_asset_histories to new archive table
INSERT INTO public.asset_history_archive (
  original_asset_id, asset_name, change_type, changed_by, 
  change_reason, old_data, new_data, created_at
)
SELECT 
  asset_id, asset_name, change_type, changed_by,
  change_reason, old_data, new_data, created_at
FROM public.other_asset_histories
ON CONFLICT DO NOTHING;
