import { useState, useCallback } from 'react';
import { format } from 'date-fns';

export interface FormData {
  transaction_date: string;
  parts_day: string;
  room: string;
  note: string;
  transaction_type: string;
}

export const useAssetEntryForm = () => {
  const [formData, setFormData] = useState<FormData>({
    transaction_date: format(new Date(), 'yyyy-MM-dd'), // Tự động điền ngày hiện tại
    parts_day: 'Sáng',
    room: '',
    note: '',
    transaction_type: 'Xuất kho',
  });

  const [multipleAssets, setMultipleAssets] = useState<string[]>([]);
  const [assetInput, setAssetInput] = useState('');

  const handleFormDataChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleRoomChange = useCallback((value: string) => {
    setFormData(prev => ({
      ...prev,
      room: value,
      note: '', // Reset note khi đổi phòng
    }));
  }, []);

  const addAsset = useCallback(() => {
    if (assetInput.trim() && !multipleAssets.includes(assetInput.trim())) {
      setMultipleAssets(prev => [...prev, assetInput.trim()]);
      setAssetInput('');
    }
  }, [assetInput, multipleAssets]);

  const removeAsset = useCallback((assetToRemove: string) => {
    setMultipleAssets(prev => prev.filter(asset => asset !== assetToRemove));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      transaction_date: format(new Date(), 'yyyy-MM-dd'),
      parts_day: 'Sáng',
      room: '',
      note: '',
      transaction_type: 'Xuất kho',
    });
    setMultipleAssets([]);
    setAssetInput('');
  }, []);

  return {
    formData,
    multipleAssets,
    assetInput,
    setAssetInput,
    handleFormDataChange,
    handleRoomChange,
    addAsset,
    removeAsset,
    resetForm,
  };
};