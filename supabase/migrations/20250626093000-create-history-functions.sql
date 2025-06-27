
-- Create RPC function to get asset histories (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_asset_histories()
RETURNS TABLE (
  id uuid,
  asset_id uuid,
  asset_name text,
  change_type text,
  changed_by text,
  change_reason text,
  old_data jsonb,
  new_data jsonb,
  created_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT 
    h.id,
    h.asset_id,
    h.asset_name,
    h.change_type,
    h.changed_by,
    h.change_reason,
    h.old_data,
    h.new_data,
    h.created_at
  FROM public.other_asset_histories h
  ORDER BY h.created_at DESC
  LIMIT 1000;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_asset_histories() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_asset_histories() TO anon;
