import { useState } from 'react';
import { toast } from 'sonner';
import { analyzeImageWithGemini, GeminiAnalysisResult } from '@/services/geminiService';

interface UseImageProcessingProps {
  onAssetCodesDetected: (codes: string[]) => void;
  onRoomDetected: (room: string) => void;
}

export const useImageProcessing = ({ onAssetCodesDetected, onRoomDetected }: UseImageProcessingProps) => {
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const processImages = async (files: FileList | null): Promise<GeminiAnalysisResult | undefined> => {
    if (!files || files.length === 0) {
      toast.error("Không có tệp nào được chọn.");
      return;
    }

    setIsProcessingImage(true);
    setIsDialogOpen(false); // Close dialog immediately

    const imageFile = files[0];

    const MAX_FILE_SIZE_MB = 5; // 5 MB
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    if (imageFile.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`Kích thước tệp quá lớn. Vui lòng chọn ảnh nhỏ hơn ${MAX_FILE_SIZE_MB}MB.`);
      setIsProcessingImage(false);
      return;
    }

    try {
      const result = await analyzeImageWithGemini(imageFile);

      console.log('Image processing result:', result);

      if (result.assetCodes && result.assetCodes.length > 0) {
        onAssetCodesDetected(result.assetCodes);
      }

      if (result.detectedRoom) {
        onRoomDetected(result.detectedRoom);
      }
      return result; // Return the result
    } catch (error) {
      console.error('Error processing image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi xử lý hình ảnh.';
      toast.error("Lỗi xử lý hình ảnh", { description: errorMessage });
      return undefined; // Return undefined on error
    } finally {
      setIsProcessingImage(false);
    }
  };

  // The openCamera function is now handled directly in AssetCodeInputs.tsx
  // and is no longer needed here as it was a duplicate.

  return {
    isProcessingImage,
    isDialogOpen,
    setIsDialogOpen,
    processImages,
    // openCamera, // Removed as it's redundant
  };
};