import React from 'react';
import { useAssetEntryForm } from '@/hooks/useAssetEntryForm';
import { useAssetSubmission } from '@/hooks/useAssetSubmission';
import TransactionDetails from '@/components/TransactionDetails';
import RoomSelection from '@/components/RoomSelection';
import AssetCodeInputs from '@/components/AssetCodeInputs';
import SubmitButtons from '@/components/SubmitButtons';
import { Card, CardContent } from '@/components/ui/card';

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
            selectedRoom={formData.room}
            onRoomChange={handleRoomChange}
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