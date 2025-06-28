import { useState } from 'react';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { FormData } from '@/types/assetSubmission';
import { validateAssetSubmission } from '@/utils/assetSubmissionValidation';
import { submitAssetTransactions } from '@/services/assetSubmissionService';
import { performEmailTest } from '@/services/emailTestService';
import { toast } from 'sonner'; // Import toast directly from sonner

export const useAssetSubmission = () => {
  const { user } = useSecureAuth();
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (
    formData: FormData,
    multipleAssets: string[],
    isRestrictedTime: boolean,
    onSuccess: () => void
  ) => {
    console.log('=== ASSET SUBMISSION DEBUG START ===');
    console.log('isRestrictedTime:', isRestrictedTime);
    console.log('formData:', formData);
    console.log('multipleAssets:', multipleAssets);
    
    if (isRestrictedTime) {
      console.log('❌ Submission blocked - restricted time');
      toast.error( // Changed from showToast
        "Không thể gửi",
        { description: 'Không thể gửi trong khung giờ 7:45-8:05 và 12:45-13:05' }
      );
      return;
    }
    
    const validation = validateAssetSubmission(multipleAssets, isRestrictedTime);
    console.log('Validation result:', validation);
    
    if (!validation.isValid) {
      console.log('❌ Validation failed:', validation.error);
      setMessage({ type: 'error', text: validation.error || '' });
      return;
    }
    
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const { savedTransactions, emailResult } = await submitAssetTransactions(
        formData,
        multipleAssets,
        user?.username || ''
      );
      
      if (emailResult.success) {
        console.log('✅ Email sent successfully');
        toast.success( // Changed from showToast
          "Thành công!",
          { description: `Đã gửi thành công ${multipleAssets.length} thông báo tài sản và email xác nhận` }
        );
      } else {
        console.log('⚠️ Email failed but database save successful');
        toast.error( // Changed from showToast
          "Lưu thành công nhưng gửi email thất bại",
          { description: `Đã lưu ${multipleAssets.length} thông báo tài sản nhưng không gửi được email: ${emailResult.error}` }
        );
      }
      
      onSuccess();
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi gửi thông báo';
      
      setMessage({ type: 'error', text: errorMessage });
      
      if (error instanceof Error && error.message.includes('email')) {
        toast.error( // Changed from showToast
          "Lưu thành công nhưng gửi email thất bại",
          { description: `Đã lưu ${multipleAssets.length} thông báo tài sản nhưng có lỗi khi gửi email` }
        );
      } else {
        toast.error( // Changed from showToast
          "Lỗi gửi thông báo",
          { description: errorMessage }
        );
      }
    } finally {
      setIsLoading(false);
      console.log('=== ASSET SUBMISSION DEBUG END ===');
    }
  };

  const handleTestEmail = async () => {
    if (!user?.username) {
      toast.error( // Changed from showToast
        "Lỗi", 
        { description: "Không tìm thấy thông tin người dùng" }
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await performEmailTest(user.username);
      
      if (result.success) {
        console.log('✅ Email sent successfully, showing success toast');
        toast.success( // Changed from showToast
          "Email test thành công!", 
          { description: "Kiểm tra hộp thư của bạn" }
        );
      } else {
        console.log('❌ Email failed, showing error toast');
        toast.error( // Changed from showToast
          "Email test thất bại", 
          { description: result.error || 'Lỗi không xác định' }
        );
      }
    } catch (error) {
      console.error('❌ Exception in handleTestEmail:', error);
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi test email";
      toast.error( // Changed from showToast
        "Lỗi test email", 
        { description: errorMessage }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    message,
    isLoading,
    handleSubmit,
    handleTestEmail,
  };
};