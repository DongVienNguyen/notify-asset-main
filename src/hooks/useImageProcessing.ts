import { useState } from 'react';
import { toast } from 'sonner'; // Import toast directly from sonner

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

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('image', files[i]);
    }

    try {
      const response = await fetch('https://itoapoyrxxmtbbuolfhk.supabase.co/functions/v1/analyze-asset-image', {
        method: 'POST',
        body: formData,
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0b2Fwb3lyeHhtdGJidW9sZmhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODQ2NDgsImV4cCI6MjA2NjI2MDY0OH0.qT7L0MDAH-qArxaoMSkCYmVYAcwdEzbXWB1PayxD_rk', // Replace with your actual Supabase anon key
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Lỗi khi phân tích hình ảnh');
      }

      const result = await response.json();
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

      if (result.room) {
        onRoomDetected(result.room);
        toast.success(
          "Phát hiện phòng thành công!",
          { description: `Đã tìm thấy phòng: ${result.room}` }
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
    // This function would typically open the device's camera
    // For web, it usually involves <input type="file" accept="image/*" capture="environment" />
    // The actual camera stream handling is more complex and often done via getUserMedia API.
    // For simplicity, we'll just open the file dialog for now.
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