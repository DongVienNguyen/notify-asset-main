import React from 'react';
import { useAssetEntryForm } from '@/hooks/useAssetEntryForm';
import { useAssetSubmission } from '@/hooks/useAssetSubmission';
import TransactionDetails from '@/components/TransactionDetails';
import RoomSelection from '@/components/RoomSelection';
import AssetCodeInputs from '@/components/AssetCodeInputs';
import SubmitButtons from '@/components/SubmitButtons';
import TransactionTypeSelection from '@/components/TransactionTypeSelection';
import { Card, CardContent } from '@/components/ui/card';
import { AssetEntryFormState } from '@/types/assetEntryFormState';

const AssetEntryForm = () => {
  const {
    formData,
    setFormData,
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

  // Callback for when asset codes are detected from image processing
  const handleAssetCodesDetected = (codes: string[]) => {
    setMultipleAssets(codes.length > 0 ? codes : ['']); // Set detected codes or reset to one empty field
  };

  // Callback for when room is detected from image processing
  const handleRoomDetected = (room: string) => {
    handleRoomChange(room); // Use the existing handler to update room and potentially note
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <RoomSelection
            formData={formData}
            onRoomChange={handleRoomChange}
            onFormDataChange={handleSpecificFormDataChange}
          />
          <AssetCodeInputs
            assets={multipleAssets}
            onAssetChange={handleAssetChange}
            onAddAsset={addAssetField}
            onRemoveAsset={removeAssetField}
            onAssetCodesDetected={handleAssetCodesDetected}
            onRoomDetected={handleRoomDetected}
          />
          <TransactionTypeSelection
            formData={formData}
            onFormDataChange={handleSpecificFormDataChange}
          />
          <TransactionDetails
            formData={formData}
            setFormData={setFormData}
            disabledBeforeDate={disabledBeforeDate}
          />
          {/* NoteInput component removed */}
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