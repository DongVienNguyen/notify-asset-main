import React from 'react';
import { useAssetEntryForm } from '@/hooks/useAssetEntryForm';
import { useAssetSubmission } from '@/hooks/useAssetSubmission';
import TransactionDetails from '@/components/TransactionDetails';
import RoomSelection from '@/components/RoomSelection';
import AssetCodeInputs from '@/components/AssetCodeInputs';
import SubmitButtons from '@/components/SubmitButtons';
import { Card, CardContent } from '@/components/ui/card';
import { AssetEntryFormState } from '@/types/assetEntryFormState'; // Import AssetEntryFormState

const AssetEntryForm = () => {
  const {
    formData,
    setFormData, // Keep setFormData to update individual fields
    multipleAssets,
    setMultipleAssets,
    handleRoomChange,
    handleAssetChange,
    addAssetField,
    removeAssetField,
    isFormValid,
    clearForm,
    disabledBeforeDate,
  } = useAssetEntryForm();

  const { handleSubmit, isSubmitting } = useAssetSubmission({
    formData,
    multipleAssets,
    clearForm,
  });

  // Helper function to update specific fields in formData
  const handleSpecificFormDataChange = (field: keyof AssetEntryFormState, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <TransactionDetails
            formData={formData}
            setFormData={setFormData}
            disabledBeforeDate={disabledBeforeDate}
          />
          <RoomSelection
            formData={formData} // Pass the entire formData object
            onRoomChange={handleRoomChange}
            onFormDataChange={handleSpecificFormDataChange} // Pass the new handler for other fields like note
          />
          <AssetCodeInputs
            assets={multipleAssets}
            onAssetChange={handleAssetChange}
            onAddAsset={addAssetField}
            onRemoveAsset={removeAssetField}
          />
          <SubmitButtons
            isSubmitting={isSubmitting}
            isFormValid={isFormValid}
          />
        </form>
      </CardContent>
    </Card>
  );
};

export default AssetEntryForm;