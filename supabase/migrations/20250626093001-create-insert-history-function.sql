
-- Create RPC function to insert asset history (bypasses RLS)
CREATE OR REPLACE FUNCTION public.insert_asset_history(
  p_asset_id uuid,
  p_asset_name text,
  p_change_type text,
  p_changed_by text,
  p_change_reason text,
  p_old_data jsonb DEFAULT NULL,
  p_new_data jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO public.other_asset_histories (
    asset_id,
    asset_name,
    change_type,
    changed_by,
    change_reason,
    old_data,
    new_data
  ) VALUES (
    p_asset_id,
    p_asset_name,
    p_change_type,
    p_changed_by,
    p_change_reason,
    p_old_data,
    p_new_data
  ) RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.insert_asset_history(uuid, text, text, text, text, jsonb, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_asset_history(uuid, text, text, text, text, jsonb, jsonb) TO anon;
