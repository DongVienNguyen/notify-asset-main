import { useState, useEffect, useMemo } from 'react';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { calculateDefaultValues } from '@/utils/defaultValues';
import { validateAllAssets } from '@/utils/assetValidation';
import { AssetEntryFormState } from '@/types/assetEntryFormState'; // Import the new interface

export const useAssetEntryForm = () => {
  const { user } = useSecureAuth();
  const [formData, setFormData] = useState<AssetEntryFormState>({
    transaction_date: '',
    parts_day: '',
    room: '',
    note: '',
    transaction_type: ''
  });
  const [multipleAssets, setMultipleAssets] = useState<string[]>(['']);

  useEffect(() => {
    if (user) {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      let defaultPartsDay = 'Sáng';

      // Rule 1: 08:00 to 12:45 -> Chiều
      if ((hour > 8 || (hour === 8 && minute >= 0)) && (hour < 12 || (hour === 12 && minute <= 45))) {
        defaultPartsDay = 'Chiều';
      } 
      // Rule 2: 13:00 today to 07:45 next day -> Sáng (base default, adjusted by room)
      else if ((hour >= 13) || (hour < 7 || (hour === 7 && minute <= 45))) {
        defaultPartsDay = 'Sáng';
      }

      const defaults = calculateDefaultValues(user);
      setFormData({
        transaction_date: defaults.transaction_date,
        parts_day: defaultPartsDay,
        room: '',
        note: '',
        transaction_type: ''
      });
    }
  }, [user]);

  const handleRoomChange = (selectedRoom: string) => {
    setFormData(prev => {
      const newData = { ...prev, room: selectedRoom, note: '' };
      
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();

      // Rule 2 check: 13:00 today to 07:45 next day
      if ((hour >= 13) || (hour < 7 || (hour === 7 && minute <= 45))) {
        if (['QLN', 'DVKH'].includes(selectedRoom)) {
          newData.parts_day = 'Sáng';
        } else if (['CMT8', 'NS', 'ĐS', 'LĐH'].includes(selectedRoom)) {
          newData.parts_day = 'Chiều';
        }
      }
      
      if (['CMT8', 'NS', 'ĐS', 'LĐH'].includes(selectedRoom)) {
        newData.note = 'Ship PGD';
      }
      
      return newData;
    });
  };

  const handleAssetChange = (index: number, value: string) => {
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    if ((sanitizedValue.match(/\./g) || []).length > 1) {
      return;
    }

    const parts = sanitizedValue.split('.');
    let finalValue = sanitizedValue;

    if (parts.length > 1) {
      const part1 = parts[0].slice(0, 4);
      const part2 = parts[1].slice(0, 2);
      finalValue = `${part1}.${part2}`;
    } else {
      finalValue = parts[0].slice(0, 4);
    }

    const newAssets = [...multipleAssets];
    newAssets[index] = finalValue;
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
    if (user) {
      const defaults = calculateDefaultValues(user);
      setFormData(prev => ({
        ...prev,
        transaction_date: defaults.transaction_date,
        parts_day: defaults.parts_day,
        room: '',
        note: '',
        transaction_type: ''
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