import { sendEmail, type EmailResponse } from '../core/emailClient';
import { formatEmailAddress } from '../utils/emailUtils';

export const sendAssetNotificationEmail = async (
  recipients: string[],
  subject: string,
  content: string
): Promise<EmailResponse> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a; text-align: center;">Thông báo Tài sản</h2>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        ${content}
      </div>
      <p style="color: #6b7280; font-size: 14px; text-align: center;">
        Đây là email tự động từ hệ thống Thông báo TS
      </p>
    </div>
  `;

  return await sendEmail({
    to: recipients,
    subject: subject,
    html: html,
    type: 'asset_notification'
  });
};

// Hàm test gửi email
export const testEmailFunction = async (username: string): Promise<EmailResponse> => {
  const testEmail = formatEmailAddress(username);
  const subject = "Test Email - Thông báo TS";
  const content = `
    <h3>Email Test Thành Công</h3>
    <p>Đây là email test từ hệ thống Thông báo TS.</p>
    <p><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</p>
    <p><strong>Người nhận:</strong> ${testEmail}</p>
    <p style="color: #16a34a; font-weight: bold;">Hệ thống email hoạt động bình thường.</p>
  `;
  
  return await sendAssetNotificationEmail([testEmail], subject, content);
};

export const sendAssetTransactionConfirmation = async (
  username: string,
  transactionData: any[], // Changed to array
  isSuccess: boolean
): Promise<EmailResponse> => {
  const recipientEmail = formatEmailAddress(username);
  
  if (isSuccess) {
    const subject = "Xác nhận thông báo tài sản thành công";
    
    // Build content for multiple assets
    const assetsListHtml = transactionData.map(data => `
      <p><strong>Mã tài sản:</strong> ${data.asset_code}.${data.asset_year}</p>
      ${data.note ? `<p><strong>Ghi chú:</strong> ${data.note}</p>` : ''}
      <hr style="border: none; border-top: 1px solid #eee; margin: 10px 0;">
    `).join('');

    const content = `
      <h3>Thông báo tài sản đã được ghi nhận thành công</h3>
      <p>Các tài sản sau đã được ghi nhận:</p>
      ${assetsListHtml}
      <p><strong>Mã nhân viên:</strong> ${transactionData[0].staff_code}</p>
      <p><strong>Ngày giao dịch:</strong> ${transactionData[0].transaction_date}</p>
      <p><strong>Buổi:</strong> ${transactionData[0].parts_day}</p>
      <p><strong>Phòng:</strong> ${transactionData[0].room}</p>
      <p><strong>Loại giao dịch:</strong> ${transactionData[0].transaction_type}</p>
      <p style="color: #16a34a; font-weight: bold;">Thông báo đã được lưu vào hệ thống thành công.</p>
    `;
    
    return await sendAssetNotificationEmail([recipientEmail], subject, content);
  } else {
    const subject = "Lỗi ghi nhận thông báo tài sản";
    const content = `
      <h3>Không thể ghi nhận thông báo tài sản</h3>
      <p>Thông báo tài sản của bạn không được ghi nhận thành công trong hệ thống.</p>
      <p style="color: #dc2626; font-weight: bold;">Vui lòng thử lại hoặc liên hệ bộ phận hỗ trợ.</p>
    `;
    
    return await sendAssetNotificationEmail([recipientEmail], subject, content);
  }
};

export const sendAssetReminderEmail = async (
  recipients: string[],
  subject: string,
  content: string
): Promise<EmailResponse> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ff9800; text-align: center;">Nhắc nhở Tài sản đến hạn</h2>
      <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
        ${content}
      </div>
      <p style="color: #6b7280; font-size: 14px; text-align: center;">
        Đây là email tự động từ hệ thống Nhắc nhở Tài sản
      </p>
    </div>
  `;

  return await sendEmail({
    to: recipients,
    subject: subject,
    html: html,
    type: 'asset_reminder'
  });
};