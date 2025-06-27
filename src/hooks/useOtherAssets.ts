
import { useState, useEffect, useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useOtherAssetOperations } from '@/hooks/useOtherAssetOperations';
import { supabase } from '@/integrations/supabase/client';

interface OtherAsset {
  id: string;
  name: string;
  deposit_date: string;
  depositor: string;
  deposit_receiver: string;
  withdrawal_date?: string;
  withdrawal_deliverer?: string;
  withdrawal_receiver?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useOtherAssets = (user: any) => {
  const [assets, setAssets] = useState<OtherAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAsset, setEditingAsset] = useState<OtherAsset | null>(null);
  const [changeReason, setChangeReason] = useState('');
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

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { loadAssets, saveAsset, deleteAsset: deleteAssetOperation } = useOtherAssetOperations(user);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const assetsData = await loadAssets();
        setAssets(assetsData);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [user]);

  // Filter assets based on search term
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => 
      asset.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      asset.depositor?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      asset.deposit_receiver?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      asset.withdrawal_deliverer?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      asset.withdrawal_receiver?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [assets, debouncedSearchTerm]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const success = await saveAsset(newAsset, editingAsset, changeReason);
      
      if (success) {
        // Reload data
        const refreshedData = await loadAssets();
        setAssets(refreshedData);
        clearForm();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const editAsset = (asset: OtherAsset) => {
    setNewAsset({
      name: asset.name,
      deposit_date: asset.deposit_date,
      depositor: asset.depositor || '',
      deposit_receiver: asset.deposit_receiver || '',
      withdrawal_date: asset.withdrawal_date || '',
      withdrawal_deliverer: asset.withdrawal_deliverer || '',
      withdrawal_receiver: asset.withdrawal_receiver || '',
      notes: asset.notes?.replace(/\[.*?\]/g, '').trim() || ''
    });
    setEditingAsset(asset);
    setChangeReason('');
  };

  const deleteAsset = async (asset: OtherAsset) => {
    setIsLoading(true);
    
    try {
      const success = await deleteAssetOperation(asset);
      
      if (success) {
        const { data: refreshedData } = await supabase
          .from('other_assets')
          .select('*')
          .order('created_at', { ascending: false });
        
        setAssets(refreshedData || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

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

  return {
    assets,
    filteredAssets,
    isLoading,
    searchTerm,
    setSearchTerm,
    editingAsset,
    changeReason,
    setChangeReason,
    newAsset,
    setNewAsset,
    handleSave,
    editAsset,
    deleteAsset,
    clearForm,
    setEditingAsset
  };
};
