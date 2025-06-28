import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSecureAuth } from '@/hooks/useSecureAuth';

export const useOtherAssets = (user: any) => {
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [changeReason, setChangeReason] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [newAsset, setNewAsset] = useState({
    name: '',
    deposit_date: '',
    depositor: '',
    deposit_receiver: '',
    withdrawal_date: '',
    withdrawal_deliverer: '',
    withdrawal_receiver: '',
    notes: ''
  });

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('other_assets')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAssets(data || []);
    } catch (error: any) {
      setMessage({ type: 'error', text: `Không thể tải tài sản: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAssets = useMemo(() => {
    return assets.filter(asset =>
      Object.values(asset).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [assets, searchTerm]);

  const clearForm = () => {
    setNewAsset({
      name: '',
      deposit_date: '',
      depositor: '',
      deposit_receiver: '',
      withdrawal_date: '',
      withdrawal_deliverer: '',
      withdrawal_receiver: '',
      notes: ''
    });
    setEditingAsset(null);
    setChangeReason('');
  };

  const handleSave = async () => {
    setMessage({ type: '', text: '' });
    if (!editingAsset && !newAsset.name) {
      setMessage({ type: 'error', text: 'Tên tài sản là bắt buộc' });
      return;
    }

    setIsLoading(true);
    try {
      if (editingAsset) {
        // Update logic
        const { data: oldAsset } = await supabase.from('other_assets').select('*').eq('id', editingAsset.id).single();
        const { error } = await supabase.from('other_assets').update(editingAsset).eq('id', editingAsset.id);
        if (error) throw error;

        // Archive change
        await supabase.from('asset_history_archive').insert({
          original_asset_id: editingAsset.id,
          asset_name: editingAsset.name,
          change_type: 'UPDATE',
          changed_by: user?.username || 'unknown',
          change_reason: changeReason,
          old_data: oldAsset,
          new_data: editingAsset
        });
        setMessage({ type: 'success', text: 'Cập nhật tài sản thành công' });
      } else {
        // Insert logic
        const { error } = await supabase.from('other_assets').insert([newAsset]);
        if (error) throw error;
        setMessage({ type: 'success', text: 'Thêm tài sản mới thành công' });
      }
      clearForm();
      loadAssets();
    } catch (error: any) {
      setMessage({ type: 'error', text: `Không thể lưu tài sản: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const editAsset = (asset: any) => {
    setEditingAsset({ ...asset });
  };

  const deleteAsset = async (assetId: string) => {
    setMessage({ type: '', text: '' });
    setIsLoading(true);
    try {
      const { data: assetToDelete } = await supabase.from('other_assets').select('*').eq('id', assetId).single();
      if (!assetToDelete) throw new Error("Không tìm thấy tài sản để xóa");

      const { error } = await supabase.from('other_assets').delete().eq('id', assetId);
      if (error) throw error;

      await supabase.from('asset_history_archive').insert({
        original_asset_id: assetId,
        asset_name: assetToDelete.name,
        change_type: 'DELETE',
        changed_by: user?.username || 'unknown',
        change_reason: 'Xóa khỏi hệ thống',
        old_data: assetToDelete,
        new_data: null
      });

      setMessage({ type: 'success', text: 'Xóa tài sản thành công' });
      loadAssets();
    } catch (error: any) {
      setMessage({ type: 'error', text: `Không thể xóa tài sản: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    assets,
    filteredAssets,
    isLoading,
    searchTerm,
    setSearchTerm,
    editingAsset,
    setEditingAsset,
    changeReason,
    setChangeReason,
    newAsset,
    setNewAsset,
    handleSave,
    editAsset,
    deleteAsset,
    clearForm,
    message,
    setMessage
  };
};