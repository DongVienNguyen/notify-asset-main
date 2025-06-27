
import React, { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AssetCodeInputs from './AssetCodeInputs';
import FormControls from './FormControls';
import SubmitButtons from './SubmitButtons';
import { useAssetEntry } from '@/hooks/useAssetEntry';

const AssetEntryForm = () => {
  const {
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
  } = useAssetEntry();

  useEffect(() => {
    if (window.innerWidth <= 768) {
      const timer = setTimeout(() => {
        const element = document.getElementById('instruction-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAssetCodesDetected = (codes: string[]) => {
    setMultipleAssets([...codes]);
  };

  const handleRoomDetected = (room: string) => {
    handleRoomChange(room);
  };

  const handleFormDataChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg border">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormControls
          formData={formData}
          onRoomChange={handleRoomChange}
          onFormDataChange={handleFormDataChange}
          showAssetInputs={false}
        />

        <AssetCodeInputs
          multipleAssets={multipleAssets}
          onAssetChange={handleAssetChange}
          onAddAssetField={addAssetField}
          onRemoveAssetField={removeAssetField}
          onAssetCodesDetected={handleAssetCodesDetected}
          onRoomDetected={handleRoomDetected}
          showToast={showToast}
        />

        <FormControls
          formData={formData}
          onRoomChange={handleRoomChange}
          onFormDataChange={handleFormDataChange}
          showAssetInputs={true}
        />

        {/* Alerts */}
        {isRestrictedTime && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-700">
              Hiện tại đang trong khung giờ cấm (7:45-8:05 hoặc 12:45-13:05). Vui lòng nhắn Zalo thay vì dùng hệ thống.
            </AlertDescription>
          </Alert>
        )}

        {message.text && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <SubmitButtons
          isRestrictedTime={isRestrictedTime}
          isFormValid={isFormValid}
          isLoading={isLoading}
          user={user}
          onClear={clearForm}
          onSubmit={handleSubmit}
          onTestEmail={handleTestEmail}
        />
      </form>
    </div>
  );
};

export default AssetEntryForm;
