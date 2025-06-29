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
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface AssetEntryFormProps {
  isRestrictedTime: boolean;
}

const AssetEntryForm: React.FC<AssetEntryFormProps> = ({ isRestrictedTime }) => {
  const { currentUser: user } = useCurrentUser();

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

  const { handleSubmit: submitAssets, isLoading: isSubmitting, handleTestEmail: testEmail } = useAssetSubmission();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitAssets(formData, multipleAssets, isRestrictedTime, clearForm);
  };

  const handleSpecificFormDataChange = (field: keyof AssetEntryFormState, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAssetCodesDetected = (codes: string[]) => {
    setMultipleAssets(codes.length > 0 ? codes : ['']);
  };

  const handleRoomDetected = (room: string) => {
    handleRoomChange(room);
  };

  return (
    <Card>
      <CardContent className="p-4 md:p-6">
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
          <SubmitButtons
            isRestrictedTime={isRestrictedTime}
            isFormValid={isFormValid}
            isLoading={isSubmitting}
            user={user}
            onClear={clearForm}
            onSubmit={handleSubmit}
            onTestEmail={testEmail}
          />
        </form>
      </CardContent>
    </Card>
  );
};

export default AssetEntryForm;