import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type OtherAsset = Database['public']['Tables']['other_assets']['Row'];
type User = {
  username: string;
  role: string;
  department: string;
} | null;

export const useOtherAssets = (user: User) => {
  const [assets, setAssets] = useState<OtherAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAsset, setEditingAsset] = useState<OtherAsset | null>(null);
  const [changeReason, setChangeReason] = useState('');
  const [newAsset, setNewAsset] = useState<Partial<OtherAsset>>({
    name: '',
    deposit_date: null,
    depositor: '',
    deposit_receiver: '',
    withdrawal_date: null,
    withdrawal_deliverer: '',
    withdrawal_receiver: '',
    notes: ''
  });

  useEffect(() => {
    const loadAssets = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('other_assets')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAssets(data || []);
      } catch (error: any) {
        console.error("Error loading other assets:", error);
        toast.error(`Không thể tải tài sản khác: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadAssets();
  }, []);

  const filteredAssets = useMemo(() => {
    if (!searchTerm) return assets;
    return assets.filter(asset =>
      Object.values(asset).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [assets, searchTerm]);

  const clearForm = () => {
    setNewAsset({
      name: '',
      deposit_date: null,
      depositor: '',
      deposit_receiver: '',
      withdrawal_date: null,
      withdrawal_deliverer: '',
      withdrawal_receiver: '',
      notes: ''
    });
    setEditingAsset(null);
    setChangeReason('');
  };

  const handleSave = async () => {
    if (!newAsset.name) {
      toast.error('Vui lòng nhập tên tài sản / thùng.');
      return;
    }

    if (editingAsset && !changeReason) {
      toast.error('Vui lòng nhập lý do thay đổi.');
      return;
    }

    try {
      setIsLoading(true);
      const assetData = { ...newAsset };

      if (editingAsset) {
        // Update existing asset
        const { data: updatedAsset, error } = await supabase
          .from('other_assets')
          .update(assetData)
          .eq('id', editingAsset.id)
          .select()
          .single();

        if (error) throw error;

        // Log change to history
        await supabase.from('asset_history_archive').insert({
          original_asset_id: editingAsset.id,
          asset_name: editingAsset.name,
          change_type: 'UPDATE',
          changed_by: user?.username || 'unknown',
          change_reason: changeReason,
          old_data: editingAsset,
          new_data: updatedAsset,
        });

        toast.success('Cập nhật tài sản thành công');
      } else {
        // Create new asset
        const { error } = await supabase.from('other_assets').insert([assetData]);
        if (error) throw error;
        toast.success('Thêm tài sản thành công');
      }

      clearForm();
      // Refresh data
      const { data, error: fetchError } = await supabase.from('other_assets').select('*').order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setAssets(data || []);

    } catch (error: any) {
      console.error("Error saving asset:", error);
      toast.error(`Không thể lưu tài sản: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const editAsset = (asset: OtherAsset) => {
    setEditingAsset(asset);
    setNewAsset({ ...asset });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteAsset = async (asset: OtherAsset) => {
    if (!user || user.role !== 'admin') {
      toast.error('Chỉ admin mới có quyền xóa.');
      return;
    }
    
    const assetId = asset?.id;
    if (!assetId) {
      toast.error("Không thể xóa tài sản: ID không hợp lệ.");
      console.error("deleteAsset called with invalid asset object:", asset);
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn xóa tài sản này? Thao tác này không thể hoàn tác.')) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Log deletion to history
      await supabase.from('asset_history_archive').insert({
        original_asset_id: assetId,
        asset_name: asset.name,
        change_type: 'DELETE',
        changed_by: user?.username || 'unknown',
        change_reason: 'Xóa khỏi hệ thống',
        old_data: asset,
        new_data: null,
      });

      // Perform deletion
      const { error } = await supabase.from('other_assets').delete().eq('id', assetId);
      if (error) throw error;

      toast.success('Xóa tài sản thành công');
      // Refresh data
      const { data, error: fetchError } = await supabase.from('other_assets').select('*').order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setAssets(data || []);

    } catch (error: any) {
      console.error("Error deleting asset:", error);
      toast.error(`Không thể xóa tài sản: ${error.message}`);
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
  };
};