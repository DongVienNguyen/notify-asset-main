
-- Xóa bảng other_asset_histories cũ vì không còn sử dụng
DROP TABLE IF EXISTS public.other_asset_histories CASCADE;

-- Xóa các function liên quan đến bảng cũ nếu có
DROP FUNCTION IF EXISTS public.get_asset_histories() CASCADE;
DROP FUNCTION IF EXISTS public.insert_asset_history(uuid, text, text, text, text, jsonb, jsonb) CASCADE;
