import { useState } from 'react';
import { analyzeImageWithGemini, GeminiAnalysisResult } from '@/services/geminiService';

interface UseImageProcessingProps {
  onAssetCodesDetected: (codes: string[]) => void;
  onRoomDetected: (room: string) => void;
  onMessageUpdate: (type: 'success' | 'error', text: string, description?: string) => void; // Changed from showToast
}

export const useImageProcessing = ({ onAssetCodesDetected, onRoomDetected, onMessageUpdate }: UseImageProcessingProps) => {
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const processImages = async (files: FileList) => {
    setIsProcessingImage(true);
    try {
      const file = files[0];
      if (!file) {
        throw new Error('Không có file được chọn');
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Vui lòng chọn file hình ảnh');
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File quá lớn. Vui lòng chọn file nhỏ hơn 10MB');
      }

      console.log('Processing image with Gemini:', file.name, 'Size:', file.size);
      
      const result: GeminiAnalysisResult = await analyzeImageWithGemini(file);
      
      console.log('Gemini analysis result:', result);
      
      if (result.assetCodes && result.assetCodes.length > 0) {
        onAssetCodesDetected(result.assetCodes);
        
        console.log('Updated assets:', result.assetCodes);
        
        // Auto-fill room if detected
        if (result.detectedRoom) {
          console.log('Auto-filling room:', result.detectedRoom);
          onRoomDetected(result.detectedRoom);
        }
        
        // Hiển thị thông báo thành công
        onMessageUpdate( // Changed to onMessageUpdate
          "success",
          "Đã điền " + result.assetCodes.length + " mã tài sản",
          `Các mã tài sản: ${result.assetCodes.join(', ')}`
        );
        
      } else {
        onMessageUpdate( // Changed to onMessageUpdate
          "error",
          "Không tìm thấy mã tài sản",
          "Không thể nhận dạng mã tài sản trong hình ảnh. Vui lòng thử lại hoặc nhập thủ công."
        );
      }
      
    } catch (error) {
      console.error('Error processing image:', error);
      onMessageUpdate( // Changed to onMessageUpdate
        "error",
        "Lỗi phân tích hình ảnh",
        error instanceof Error ? error.message : 'Có lỗi xảy ra khi phân tích hình ảnh'
      );
    } finally {
      setIsProcessingImage(false);
      setIsDialogOpen(false);
    }
  };

  const openCamera = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.multiple = false;
    
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        console.log('Camera captured file:', files[0].name);
        processImages(files);
      }
    };
    
    input.click();
  };

  return {
    isProcessingImage,
    isDialogOpen,
    setIsDialogOpen,
    processImages,
    openCamera
  };
};