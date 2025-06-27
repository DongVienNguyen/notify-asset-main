
import type { EmailResponse } from '../core/emailClient';

// Helper function to format email address with .hvu@vietcombank.com.vn domain
export const formatEmailAddress = (username: string): string => {
  return `${username}.hvu@vietcombank.com.vn`;
};

// Hàm kiểm tra email đã được gửi thành công hay chưa
export const checkEmailStatus = async (emailResponse: EmailResponse): Promise<boolean> => {
  if (!emailResponse.success) {
    console.log('Email check: Failed to send email -', emailResponse.error);
    return false;
  }
  
  console.log('Email check: Email sent successfully -', emailResponse.message);
  return true;
};
