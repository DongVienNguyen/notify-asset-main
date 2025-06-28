import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useOtherAssetOperations } from '@/hooks/useOtherAssetOperations'; // Import the operations hook

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

  const { loadAssets: loadOtherAssets, saveAsset, deleteAsset: deleteOtherAsset } = useOtherAssetOperations(user); // Use functions from the operations hook

  useEffect(() => {
    const fetchAssets = async () => {
      setIsLoading(true);
      const fetchedAssets = await loadOtherAssets(); // Use the loadAssets from operations hook
      setAssets(fetchedAssets);
      setIsLoading(false);
    };
    fetchAssets();
  }, [user, loadOtherAssets]); // Depend on user and loadOtherAssets

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
    if (!newAsset.name.trim()) { // Check for name validity here as well
      setMessage({ type: 'error', text: 'Tên tài sản là bắt buộc' });
      return;
    }

    setIsLoading(true);
    const success = await saveAsset(newAsset, editingAsset, changeReason); // Use saveAsset from operations hook
    if (success) {
      setMessage({ type: 'success', text: editingAsset ? 'Cập nhật tài sản thành công' : 'Thêm tài sản mới thành công' });
      clearForm();
      const fetchedAssets = await loadOtherAssets(); // Reload assets after save
      setAssets(fetchedAssets);
    } else {
      // Error message is handled by useOtherAssetOperations
    }
    setIsLoading(false);
  };

  const editAsset = (asset: any) => {
    setEditingAsset({ ...asset });
    setNewAsset({
      name: asset.name || '',
      deposit_date: asset.deposit_date || '',
      depositor: asset.depositor || '',
      deposit_receiver: asset.deposit_receiver || '',
      withdrawal_date: asset.withdrawal_date || '',
      withdrawal_deliverer: asset.withdrawal_deliverer || '',
      withdrawal_receiver: asset.withdrawal_receiver || '',
      notes: asset.notes || ''
    });
  };

  const deleteAsset = async (asset: any) => { // Changed to accept full asset object
    setMessage({ type: '', text: '' });
    setIsLoading(true);
    const success = await deleteOtherAsset(asset); // Use deleteAsset from operations hook
    if (success) {
      setMessage({ type: 'success', text: 'Xóa tài sản thành công' });
      const fetchedAssets = await loadOtherAssets(); // Reload assets after delete
      setAssets(fetchedAssets);
    } else {
      // Error message is handled by useOtherAssetOperations
    }
    setIsLoading(false);
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