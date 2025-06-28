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

  // New showToast function
  const showToast = (title: string, description?: string, variant?: 'default' | 'destructive') => {
    if (variant === 'destructive') {
      toast.error(title, { description });
    } else {
      toast.success(title, { description });
    }
  };

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
      showToast( // Changed to showToast
        "Không thể gửi",
        'Không thể gửi trong khung giờ 7:45-8:05 và 12:45-13:05',
        'destructive'
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
        showToast( // Changed to showToast
          "Thành công!",
          `Đã gửi thành công ${multipleAssets.length} thông báo tài sản và email xác nhận`
        );
      } else {
        console.log('⚠️ Email failed but database save successful');
        showToast( // Changed to showToast
          "Lưu thành công nhưng gửi email thất bại",
          `Đã lưu ${multipleAssets.length} thông báo tài sản nhưng không gửi được email: ${emailResult.error}`,
          'destructive'
        );
      }
      
      onSuccess();
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi gửi thông báo';
      
      setMessage({ type: 'error', text: errorMessage });
      
      if (error instanceof Error && error.message.includes('email')) {
        showToast( // Changed to showToast
          "Lưu thành công nhưng gửi email thất bại",
          `Đã lưu ${multipleAssets.length} thông báo tài sản nhưng có lỗi khi gửi email`,
          'destructive'
        );
      } else {
        showToast( // Changed to showToast
          "Lỗi gửi thông báo",
          errorMessage,
          'destructive'
        );
      }
    } finally {
      setIsLoading(false);
      console.log('=== ASSET SUBMISSION DEBUG END ===');
    }
  };

  const handleTestEmail = async () => {
    if (!user?.username) {
      showToast( // Changed to showToast
        "Lỗi", 
        "Không tìm thấy thông tin người dùng",
        'destructive'
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await performEmailTest(user.username);
      
      if (result.success) {
        console.log('✅ Email test thành công, hiển thị toast thành công');
        showToast( // Changed to showToast
          "Email test thành công!", 
          "Kiểm tra hộp thư của bạn"
        );
      } else {
        console.log('❌ Email test thất bại, hiển thị toast lỗi');
        showToast( // Changed to showToast
          "Email test thất bại", 
          result.error || 'Lỗi không xác định',
          'destructive'
        );
      }
    } catch (error) {
      console.error('❌ Ngoại lệ trong handleTestEmail:', error);
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi test email";
      showToast( // Changed to showToast
        "Lỗi test email", 
        errorMessage,
        'destructive'
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
    showToast, // Now showToast is returned
  };
};