import { supabase } from '@/integrations/supabase/client';
import { Staff, LoginResult } from '@/types/auth';
import { validateInput } from '@/utils/inputValidation';
import { sanitizeUserForClient, checkRateLimit, logSecurityEvent } from '@/utils/secureAuthUtils';

// This function will now call the Edge Function for login
export const secureLoginUser = async (username: string, password: string): Promise<{ user: Staff | null; error: string | null }> => {
  // Input validation (client-side pre-check)
  if (!validateInput.isValidUsername(username)) {
    logSecurityEvent('INVALID_USERNAME_ATTEMPT', { username: username.slice(0, 10) });
    return { user: null, error: 'Tên đăng nhập không hợp lệ' };
  }

  // Rate limiting (client-side pre-check, actual rate limiting will be on Edge Function too)
  if (!checkRateLimit(`auth_${username}`, 5, 15 * 60 * 1000)) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', { username });
    return { user: null, error: 'Quá nhiều lần thử. Vui lòng thử lại sau 15 phút' };
  }

  try {
    const normalizedUsername = validateInput.sanitizeString(username.toLowerCase().trim());
    
    // Call the login-user Edge Function
    const { data, error: invokeError } = await supabase.functions.invoke('login-user', {
      body: { username: normalizedUsername, password: password }
    });

    if (invokeError) {
      logSecurityEvent('EDGE_FUNCTION_INVOKE_ERROR', { error: invokeError.message });
      return { user: null, error: 'Lỗi kết nối máy chủ' };
    }

    if (data && data.success) {
      logSecurityEvent('LOGIN_SUCCESS', { username: normalizedUsername });
      return { user: sanitizeUserForClient(data.user), error: null };
    } else {
      logSecurityEvent('LOGIN_FAILED_EDGE_FUNCTION', { username: normalizedUsername, error: data?.error });
      return { user: null, error: data?.error || 'Đăng nhập thất bại' };
    }
  } catch (error) {
    logSecurityEvent('LOGIN_EDGE_FUNCTION_EXCEPTION', { error: (error as Error).message });
    return { user: null, error: 'Đã xảy ra lỗi trong quá trình đăng nhập' };
  }
};

// These functions are no longer needed on the client-side as their logic is in the Edge Function
// export const secureValidatePassword = async (password: string, storedPassword: string): Promise<boolean> => { /* ... */ };
// export const secureHandleFailedLogin = async (username: string, currentAttempts: number = 0): Promise<LoginResult> => { /* ... */ };
// export const secureResetFailedLoginAttempts = async (username: string): Promise<void> => { /* ... */ };

// Keep sanitizeUserForClient if it's used elsewhere for client-side data
export { sanitizeUserForClient } from '@/utils/secureAuthUtils';