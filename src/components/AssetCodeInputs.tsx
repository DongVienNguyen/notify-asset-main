import React from 'react';
import { Plus, Minus, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageProcessingDialog from './ImageProcessingDialog';
import { useImageProcessing } from '@/hooks/useImageProcessing';
import { toast } from 'sonner'; // Import toast directly from sonner

interface AssetCodeInputsProps {
  multipleAssets: string[];
  onAssetChange: (index: number, value: string) => void;
  onAddAssetField: () => void;
  onRemoveAssetField: (index: number) => void;
  onAssetCodesDetected: (codes: string[]) => void;
  onRoomDetected: (room: string) => void;
}

const AssetCodeInputs: React.FC<AssetCodeInputsProps> = ({
  multipleAssets,
  onAssetChange,
  onAddAssetField,
  onRemoveAssetField,
  onAssetCodesDetected,
  onRoomDetected,
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
  });

  const handleImageProcessed = (result: { assetCodes: string[]; detectedRoom?: string }) => {
    if (result.assetCodes.length > 0) {
      toast.success(
        "Phát hiện mã tài sản thành công!",
        { description: `Đã tìm thấy ${result.assetCodes.length} mã tài sản` }
      );
    } else {
      toast.info("Không tìm thấy mã tài sản nào trong hình ảnh.");
    }
    
    if (result.detectedRoom) {
      toast.success(
        "Phát hiện phòng thành công!",
        { description: `Đã tìm thấy phòng: ${result.detectedRoom}` }
      );
    } else {
      toast.info("Không tìm thấy thông tin phòng trong hình ảnh.");
    }
  };

  const handleProcessImages = async (files: FileList) => {
    const result = await processImages(files);
    if (result) {
      handleImageProcessed(result);
    }
  };

  const handleOpenCamera = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Suggests rear camera on mobile
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      const result = await processImages(target.files);
      if (result) {
        handleImageProcessed(result);
      }
    };
    input.click();
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
          openCamera={handleOpenCamera} // Use the new handler
          processImages={handleProcessImages} // Use the new handler
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