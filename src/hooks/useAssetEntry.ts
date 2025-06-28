import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useAssetEntryForm } from '@/hooks/useAssetEntryForm';
import { useTimeRestriction } from '@/hooks/useTimeRestriction';
import { useAssetSubmission } from '@/hooks/useAssetSubmission';

export const useAssetEntry = () => {
  const { user } = useSecureAuth();
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
    isLoading,
    handleSubmit: submitAssets,
    handleTestEmail,
  } = useAssetSubmission();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitAssets(formData, multipleAssets, isRestrictedTime, clearForm);
  };

  return {
    formData,
    setFormData,
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
    user
  };
};