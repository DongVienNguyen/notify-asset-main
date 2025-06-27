
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
    console.log('Sending email via Edge Function:', emailData);
    
    const { data, error } = await supabase.functions.invoke('send-notification-email', {
      body: emailData
    });

    console.log('Edge Function response:', { data, error });

    if (error) {
      console.error('Edge Function error:', error);
      throw new Error(`Lỗi gửi email: ${error.message}`);
    }

    // Kiểm tra response từ Edge Function
    if (data && !data.success) {
      console.error('Email service error:', data.error);
      throw new Error(`Lỗi từ dịch vụ email: ${data.error}`);
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
