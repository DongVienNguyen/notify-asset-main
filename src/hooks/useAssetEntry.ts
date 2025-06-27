
import { useAuth } from '@/hooks/useAuth';
import { useAssetEntryForm } from '@/hooks/useAssetEntryForm';
import { useTimeRestriction } from '@/hooks/useTimeRestriction';
import { useAssetSubmission } from '@/hooks/useAssetSubmission';

export const useAssetEntry = () => {
  const { user } = useAuth();
  const { isRestrictedTime } = useTimeRestriction();
  const {
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
  } = useAssetEntryForm();
  
  const {
    message,
    isLoading,
    handleSubmit: submitAssets,
    handleTestEmail,
    showToast
  } = useAssetSubmission();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitAssets(formData, multipleAssets, isRestrictedTime, clearForm);
  };

  return {
    formData,
    setFormData,
    message,
    isLoading,
    isRestrictedTime,
    multipleAssets,
    setMultipleAssets,
    isFormValid,
    handleRoomChange,
    handleAssetChange,
    addAssetField,
    removeAssetField,
    handleSubmit,
    handleTestEmail,
    clearForm,
    showToast,
    user
  };
};
