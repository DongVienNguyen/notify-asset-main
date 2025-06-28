import { useState } from 'react';
import { toast } from 'sonner'; // Import toast directly from sonner
import { analyzeImageWithGemini } from '@/services/geminiService'; // Import the service

interface UseImageProcessingProps {
  onAssetCodesDetected: (codes: string[]) => void;
  onRoomDetected: (room: string) => void;
}

export const useImageProcessing = ({ onAssetCodesDetected, onRoomDetected }: UseImageProcessingProps) => {
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const processImages = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      toast.error("Không có tệp nào được chọn.");
      return;
    }

    setIsProcessingImage(true);
    setIsDialogOpen(false); // Close dialog immediately

    // Process only the first file for now, as the Gemini API function expects a single image
    const imageFile = files[0];

    try {
      const result = await analyzeImageWithGemini(imageFile); // Use the centralized service function

      console.log('Image processing result:', result);

      if (result.assetCodes && result.assetCodes.length > 0) {
        onAssetCodesDetected(result.assetCodes);
        toast.success(
          "Phát hiện mã tài sản thành công!",
          { description: `Đã tìm thấy ${result.assetCodes.length} mã tài sản` }
        );
      } else {
        toast.info("Không tìm thấy mã tài sản nào trong hình ảnh.");
      }

      if (result.detectedRoom) { // Use 'detectedRoom' as per GeminiAnalysisResult interface
        onRoomDetected(result.detectedRoom);
        toast.success(
          "Phát hiện phòng thành công!",
          { description: `Đã tìm thấy phòng: ${result.detectedRoom}` }
        );
      } else {
        toast.info("Không tìm thấy thông tin phòng trong hình ảnh.");
      }

    } catch (error) {
      console.error('Error processing image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi xử lý hình ảnh.';
      toast.error("Lỗi xử lý hình ảnh", { description: errorMessage });
    } finally {
      setIsProcessingImage(false);
    }
  };

  const openCamera = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Suggests rear camera on mobile
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      processImages(target.files);
    };
    input.click();
  };

  return {
    isProcessingImage,
    isDialogOpen,
    setIsDialogOpen,
    processImages,
    openCamera,
  };
};