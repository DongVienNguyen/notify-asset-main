import { useState, useEffect, useMemo } from 'react';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { validateAllAssets } from '@/utils/assetValidation';
import { AssetEntryFormState } from '@/types/assetEntryFormState';
import { getTransactionDateRules, getGMTPlus7Date } from '@/utils/dateUtils';

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
  const [disabledBeforeDate, setDisabledBeforeDate] = useState<Date | undefined>();

  const setDefaultValues = () => {
    const { defaultDate, disabledBefore } = getTransactionDateRules();
    setDisabledBeforeDate(disabledBefore);

    const now = getGMTPlus7Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    let defaultPartsDay = 'Sáng';

    // Rule 1: 08:00 to 12:45 -> Chiều
    if ((hour >= 8) && (hour < 12 || (hour === 12 && minute <= 45))) {
      defaultPartsDay = 'Chiều';
    } else {
      defaultPartsDay = 'Sáng';
    }

    setFormData({
      transaction_date: defaultDate,
      parts_day: defaultPartsDay,
      room: '',
      note: '',
      transaction_type: ''
    });
  };

  useEffect(() => {
    if (user) {
      setDefaultValues();
    }
  }, [user]);

  const handleRoomChange = (selectedRoom: string) => {
    setFormData(prev => {
      const newData = { ...prev, room: selectedRoom, note: '' };
      
      const now = getGMTPlus7Date();
      const hour = now.getHours();

      // Rule 2 check: 13:00 today to 07:59 next day
      if (hour >= 13 || hour < 8) {
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
      setDefaultValues();
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
    clearForm,
    disabledBeforeDate
  };
};