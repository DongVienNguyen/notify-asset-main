import { supabase } from '@/integrations/supabase/client';

export interface EmailRequest {
  to: string[];
  subject: string;
  html: string;
  type?: string;
  attachments?: Array<{
    filename: string;
    content: string;
    encoding: string;
  }>;
}

export interface EmailResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export const sendEmail = async (emailData: EmailRequest): Promise<EmailResponse> => {
  try {
    if (!emailData.to || emailData.to.length === 0) {
      return {
        success: false,
        error: 'Recipient list cannot be empty.',
        message: 'Không thể gửi email: Danh sách người nhận trống.'
      };
    }

    console.log('Sending email via Edge Function:', emailData);
    
    const { data, error } = await supabase.functions.invoke('send-notification-email', {
      body: emailData
    });

    console.log('Edge Function response:', { data, error });

    if (error) {
      console.error('Edge Function invocation error details:', error);
      return {
        success: false,
        error: `Lỗi gửi email từ Edge Function: ${error.message || JSON.stringify(error)}`,
        message: 'Không thể gửi email'
      };
    }

    // Kiểm tra response từ Edge Function
    if (data && !data.success) {
      console.error('Email service error:', data);
      return {
        success: false,
        error: `Lỗi từ dịch vụ email: ${data.error || 'Lỗi không xác định'}`,
        message: data.message || 'Không thể gửi email',
        data: data
      };
    }

    console.log('Email sent successfully:', data);
    return {
      success: true,
      data: data,
      message: 'Email đã được gửi thành công'
    };
  } catch (error) {
    console.error('Error in sendEmail:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định',
      message: 'Không thể gửi email'
    };
  }
};