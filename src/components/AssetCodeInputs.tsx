import React from 'react';
import { Plus, Minus, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageProcessingDialog from './ImageProcessingDialog';
import { useImageProcessing } from '@/hooks/useImageProcessing';

interface AssetCodeInputsProps {
  multipleAssets: string[];
  onAssetChange: (index: number, value: string) => void;
  onAddAssetField: () => void;
  onRemoveAssetField: (index: number) => void;
  onAssetCodesDetected: (codes: string[]) => void;
  onRoomDetected: (room: string) => void;
  onMessageUpdate: (type: 'success' | 'error', text: string, description?: string) => void; // Changed from showToast
}

const AssetCodeInputs: React.FC<AssetCodeInputsProps> = ({
  multipleAssets,
  onAssetChange,
  onAddAssetField,
  onRemoveAssetField,
  onAssetCodesDetected,
  onRoomDetected,
  onMessageUpdate // Changed from showToast
}) => {
  const {
    isProcessingImage,
    isDialogOpen,
    setIsDialogOpen,
    processImages,
    openCamera
  } = useImageProcessing({
    onAssetCodesDetected,
    onRoomDetected,
    onMessageUpdate // Changed from showToast
  });

  const handleImageProcessed = (result: { assetCodes: string[]; room?: string }) => {
    if (result.assetCodes.length > 0) {
      onAssetCodesDetected(result.assetCodes);
      onMessageUpdate( // Changed to onMessageUpdate
        "success",
        "Phát hiện mã tài sản thành công!",
        `Đã tìm thấy ${result.assetCodes.length} mã tài sản`
      );
    }
    
    if (result.room) {
      onRoomDetected(result.room);
      onMessageUpdate( // Changed to onMessageUpdate
        "success",
        "Phát hiện phòng thành công!",
        `Đã tìm thấy phòng: ${result.room}`
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">
          Nhập [Mã TS].[Năm TS]: Có dấu CHẤM giữa mã TS và năm TS
        </Label>
        <ImageProcessingDialog
          isProcessingImage={isProcessingImage}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          openCamera={openCamera}
          processImages={processImages}
        />
      </div>
      
      <div className="space-y-3">
        {multipleAssets.map((asset, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Input
              value={asset}
              onChange={(e) => onAssetChange(index, e.target.value)}
              placeholder="259.24"
              className="text-center font-mono"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onAddAssetField}
              className="text-green-600"
            >
              <Plus className="w-4 h-4" />
            </Button>
            {multipleAssets.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => onRemoveAssetField(index)}
                className="text-red-600"
              >
                <Minus className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetCodeInputs;