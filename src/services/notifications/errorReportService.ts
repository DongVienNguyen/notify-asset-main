
import { supabase } from '@/integrations/supabase/client';
import { formatEmailAddress } from '../utils/emailUtils';
import type { EmailRequest, EmailResponse } from '../core/emailClient';

export const sendErrorReport = async (
  username: string,
  staffName: string,
  errorContent: string,
  imageFile?: File | null
): Promise<EmailResponse> => {
  try {
    let imageBase64 = '';
    let imageName = '';
    
    if (imageFile) {
      // Convert image to base64
      const reader = new FileReader();
      imageBase64 = await new Promise((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data:image/jpeg;base64, prefix
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });
      imageName = imageFile.name;
    }

    const subject = `Báo lỗi ứng dụng từ ${staffName} (${username})`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626; text-align: center;">Báo lỗi ứng dụng Thông báo TS</h2>
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="color: #dc2626; margin-top: 0;">Thông tin người báo lỗi:</h3>
          <p><strong>Username:</strong> ${username}</p>
          <p><strong>Họ tên:</strong> ${staffName}</p>
          <p><strong>Email:</strong> ${formatEmailAddress(username)}</p>
          <p><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</p>
        </div>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Nội dung lỗi:</h3>
          <p style="white-space: pre-wrap; background-color: #ffffff; padding: 15px; border-radius: 4px; border: 1px solid #e5e7eb;">${errorContent}</p>
        </div>
        ${imageFile ? `
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0369a1; margin-top: 0;">Hình ảnh đính kèm:</h3>
            <p><strong>Tên file:</strong> ${imageName}</p>
            <p><em>Hình ảnh được đính kèm trong email này.</em></p>
          </div>
        ` : ''}
        <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
          Email tự động từ hệ thống Thông báo TS
        </p>
      </div>
    `;

    const emailData: EmailRequest = {
      to: ['dongnv.hvu@vietcombank.com.vn', 'ngviendong@gmail.com'],
      subject: subject,
      html: html,
      type: 'error_report'
    };

    // If there's an image, add it as attachment in the email data
    if (imageBase64 && imageName) {
      (emailData as any).attachments = [{
        filename: imageName,
        content: imageBase64,
        encoding: 'base64'
      }];
    }

    console.log('Sending error report email:', emailData);
    
    const { data, error } = await supabase.functions.invoke('send-notification-email', {
      body: emailData
    });

    console.log('Error report email response:', { data, error });

    if (error) {
      console.error('Error report email error:', error);
      throw new Error(`Lỗi gửi báo lỗi: ${error.message}`);
    }

    if (data && !data.success) {
      console.error('Error report email service error:', data.error);
      throw new Error(`Lỗi từ dịch vụ email: ${data.error}`);
    }

    console.log('Error report email sent successfully:', data);
    return {
      success: true,
      data: data,
      message: 'Báo lỗi đã được gửi thành công'
    };
  } catch (error) {
    console.error('Error in sendErrorReport:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định',
      message: 'Không thể gửi báo lỗi'
    };
  }
};
