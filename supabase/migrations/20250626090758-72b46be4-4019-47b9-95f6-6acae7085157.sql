
-- Kiểm tra constraint hiện tại
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.other_asset_histories'::regclass 
AND contype = 'c';

-- Xóa constraint cũ nếu có
ALTER TABLE public.other_asset_histories DROP CONSTRAINT IF EXISTS other_asset_histories_change_type_check;

-- Tạo lại constraint với các giá trị đúng
ALTER TABLE public.other_asset_histories ADD CONSTRAINT other_asset_histories_change_type_check 
CHECK (change_type IN ('create', 'update', 'delete'));

-- Kiểm tra lại constraint sau khi tạo
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.other_asset_histories'::regclass 
AND contype = 'c';
