import React from 'react';
import { Camera, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ImageProcessingDialogProps {
  isProcessingImage: boolean;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  onCameraClick: () => void; // Changed from openCamera
  onUploadClick: (files: FileList) => void; // Changed from processImages
}

const ImageProcessingDialog = ({
  isProcessingImage,
  isDialogOpen,
  setIsDialogOpen,
  onCameraClick, // Updated prop name
  onUploadClick // Updated prop name
}: ImageProcessingDialogProps) => {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-green-600">
          <Camera className="w-4 h-4 mr-1" />
          AI
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trích xuất mã tài sản từ hình ảnh</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Button 
            className="w-full" 
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={isProcessingImage}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isProcessingImage ? 'Đang xử lý...' : 'Upload từ thiết bị'}
          </Button>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && onUploadClick(e.target.files)} // Updated handler
          />
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onCameraClick} // Updated handler
            disabled={isProcessingImage}
          >
            <Camera className="w-4 h-4 mr-2" />
            {isProcessingImage ? 'Đang xử lý...' : 'Chụp ảnh'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageProcessingDialog;