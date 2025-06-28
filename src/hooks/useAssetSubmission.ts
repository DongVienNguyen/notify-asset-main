import { useState } from 'react';
import { saveAssetTransactions } from '@/services/assetService';
import { sendTestEmail } from '@/services/emailTestService';
import { createToastUtils } from '@/utils/toastUtils';
import { useToast } from '@/components/ui/use-toast'; // Import useToast

export const useAssetSubmission = () => {
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast(); // Get toast object from useToast
  const showToast = createToastUtils(toast); // Create showToast using the toast object

  const handleSubmit = async (
    formData: {
      staffCode: string;
      transactionDate: string;
      partsDay: string;
      room: string;
      transactionType: string;
      note: string;
    },
    multipleAssets: string[],
    isRestrictedTime: boolean,
    clearForm: () => void
  ) => {
    if (isRestrictedTime) {
      setMessage({ text: 'Hiện tại đang trong khung giờ cấm. Vui lòng nhắn Zalo thay vì dùng hệ thống.', type: 'error' });
      showToast('Lỗi', 'Hiện tại đang trong khung giờ cấm. Vui lòng nhắn Zalo thay vì dùng hệ thống.', 'destructive');
      return;
    }

    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const transactions = multipleAssets.map(asset => {
        const [assetCodeStr, assetYearStr] = asset.split('.');
        return {
          staff_code: formData.staffCode,
          transaction_date: formData.transactionDate,
          parts_day: formData.partsDay,
          room: formData.room,
          transaction_type: formData.transactionType,
          asset_year: parseInt(assetYearStr, 10),
          asset_code: parseInt(assetCodeStr, 10),
          note: formData.note,
        };
      });

      await saveAssetTransactions(transactions);
      setMessage({ text: 'Giao dịch đã được lưu thành công!', type: 'success' });
      showToast('Thành công', 'Giao dịch đã được lưu thành công!');
      clearForm();
    } catch (error: any) {
      console.error('Lỗi khi lưu giao dịch:', error);
      setMessage({ text: `Lỗi: ${error.message}`, type: 'error' });
      showToast('Lỗi', `Lỗi khi lưu giao dịch: ${error.message}`, 'destructive');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestEmail = async () => {
    setIsLoading(true);
    try {
      await sendTestEmail();
      showToast('Thành công', 'Email test đã được gửi.');
    } catch (error: any) {
      console.error('Lỗi gửi email test:', error);
      showToast('Lỗi', `Lỗi gửi email test: ${error.message}`, 'destructive');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    message,
    isLoading,
    handleSubmit,
    handleTestEmail,
    showToast, // Return showToast
  };
};