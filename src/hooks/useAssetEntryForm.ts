
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { calculateDefaultValues } from '@/utils/defaultValues';
import { validateAllAssets } from '@/utils/assetValidation';

interface FormData {
  transaction_date: string;
  parts_day: string;
  room: string;
  note: string;
  transaction_type: string;
}

export const useAssetEntryForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    transaction_date: '',
    parts_day: '',
    room: '',
    note: '',
    transaction_type: ''
  });
  const [multipleAssets, setMultipleAssets] = useState<string[]>(['']);

  useEffect(() => {
    if (user) {
      const defaults = calculateDefaultValues(user);
      setFormData(prev => ({
        ...prev,
        transaction_date: defaults.transaction_date,
        parts_day: defaults.parts_day
      }));
    }
  }, [user]);

  const handleRoomChange = (selectedRoom: string) => {
    setFormData(prev => {
      const newData = { ...prev, room: selectedRoom };
      
      if (selectedRoom === 'QLN') {
        newData.note = '';
      } else if (['CMT8', 'NS', 'ĐS', 'LĐH'].includes(selectedRoom)) {
        newData.note = 'Ship PGD';
        newData.parts_day = 'Chiều';
      }
      
      return newData;
    });
  };

  const handleAssetChange = (index: number, value: string) => {
    const newAssets = [...multipleAssets];
    newAssets[index] = value;
    setMultipleAssets(newAssets);
  };

  const addAssetField = () => {
    setMultipleAssets([...multipleAssets, '']);
  };

  const removeAssetField = (index: number) => {
    if (multipleAssets.length > 1) {
      const newAssets = multipleAssets.filter((_, i) => i !== index);
      setMultipleAssets(newAssets);
    }
  };

  const isFormValid = useMemo(() => {
    return formData.room && 
           formData.transaction_type && 
           formData.transaction_date && 
           formData.parts_day &&
           multipleAssets.every(asset => asset.trim() && validateAllAssets([asset]).isValid);
  }, [formData, multipleAssets]);

  const clearForm = () => {
    setMultipleAssets(['']);
    setFormData({ transaction_date: '', parts_day: '', room: '', note: '', transaction_type: '' });
    if (user) {
      const defaults = calculateDefaultValues(user);
      setFormData(prev => ({
        ...prev,
        transaction_date: defaults.transaction_date,
        parts_day: defaults.parts_day
      }));
    }
  };

  return {
    formData,
    setFormData,
    multipleAssets,
    setMultipleAssets,
    isFormValid,
    handleRoomChange,
    handleAssetChange,
    addAssetField,
    removeAssetField,
    clearForm
  };
};
