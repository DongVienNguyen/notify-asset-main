import { supabase } from '@/integrations/supabase/client';
import { Staff } from '@/types/auth';

export const secureLoginUser = async (username: string, password: string): Promise<{ user: Staff | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.functions.invoke('login-user', {
      body: { username, password },
    });

    if (error) {
      console.error('Error invoking login function:', error);
      return { user: null, error: 'Không thể kết nối đến máy chủ xác thực.' };
    }

    if (!data.success) {
      return { user: null, error: data.error || 'Tên đăng nhập hoặc mật khẩu không đúng' };
    }

    return { user: data.user, error: null };
  } catch (err) {
    console.error('Exception during login:', err);
    return { user: null, error: 'Đã xảy ra lỗi không mong muốn.' };
  }
};

export const checkAccountStatus = async (username: string): Promise<{ isLocked: boolean; error: string | null }> => {
  if (!username) {
    return { isLocked: false, error: null };
  }
  try {
    const { data, error } = await supabase.functions.invoke('check-account-status', {
      body: { username },
    });

    if (error) {
      console.error('Error invoking check-account-status function:', error);
      return { isLocked: false, error: 'Không thể kiểm tra trạng thái tài khoản.' };
    }

    if (data.error) {
       console.error('Function returned error:', data.error);
       return { isLocked: false, error: data.error };
    }

    return { isLocked: data.isLocked, error: null };
  } catch (err) {
    console.error('Exception checking account status:', err);
    return { isLocked: false, error: 'Lỗi hệ thống khi kiểm tra tài khoản.' };
  }
};