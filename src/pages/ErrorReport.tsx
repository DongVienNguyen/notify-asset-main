import React, { useState, useEffect } from 'react';
import { Camera, Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner'; // Changed from '@/components/ui/use-toast'
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { sendErrorReport } from '@/services/emailService';

interface Staff {
  id: string;
  username: string;
  staff_name: string;
  department: string;
}

const ErrorReport = () => {
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
  const [errorContent, setErrorContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  // const { toast } = useToast(); // Removed
  const navigate = useNavigate();

  useEffect(() => {
    const staffData = localStorage.getItem('loggedInStaff');
    if (staffData) {
      setCurrentStaff(JSON.parse(staffData));
    }
  }, []);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Vui lòng chọn file hình ảnh");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Vui lòng chọn file nhỏ hơn 10MB");
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
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
        const file = files[0];
        setSelectedImage(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!errorContent.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập nội dung báo lỗi' });
      return;
    }

    if (!currentStaff) {
      setMessage({ type: 'error', text: 'Không tìm thấy thông tin người dùng' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await sendErrorReport(
        currentStaff.username,
        currentStaff.staff_name,
        errorContent,
        selectedImage
      );

      if (result.success) {
        toast.success("Báo lỗi đã được gửi thành công. Chúng tôi sẽ xem xét và phản hồi sớm nhất.");
        
        // Reset form
        setErrorContent('');
        setSelectedImage(null);
        setImagePreview(null);
        
        // Navigate back after 2 seconds
        setTimeout(() => {
          navigate('/asset-entry');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Có lỗi xảy ra khi gửi báo lỗi' });
      }
    } catch (error) {
      console.error('Error submitting error report:', error);
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi gửi báo lỗi' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/asset-entry')}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Thông báo lỗi ứng dụng</h1>
            <p className="text-gray-600">Báo cáo lỗi và gửi hình ảnh minh họa</p>
          </div>
        </div>

        {/* Main Form */}
        <Card>
          <CardContent className="space-y-6 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sender Info */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Người gửi</Label>
                <Input
                  value={currentStaff?.username || ''}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              {/* Error Content */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Nội dung báo lỗi</Label>
                <Textarea
                  value={errorContent}
                  onChange={(e) => setErrorContent(e.target.value)}
                  placeholder="Nhập sơ bộ lỗi và ấn nút gửi hình ảnh bên dưới."
                  className="min-h-32"
                  required
                />
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Hình ảnh đính kèm</Label>
                  <div className="border rounded-lg p-4">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-w-full h-auto max-h-64 mx-auto rounded"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                      }}
                      className="mt-2 text-red-600"
                    >
                      Xóa hình ảnh
                    </Button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {message.text && (
                <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={openCamera}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Chụp ảnh
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Chọn ảnh
                  </Button>
                  
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !errorContent.trim()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isLoading ? (
                    'Đang gửi...'
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Gửi báo lỗi
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ErrorReport;