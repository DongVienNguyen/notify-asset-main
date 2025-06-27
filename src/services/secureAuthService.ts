
import { supabase } from '@/integrations/supabase/client';
import { Staff, LoginResult } from '@/types/auth';
import bcrypt from 'bcryptjs';
import { validateInput } from '@/utils/inputValidation';
import { sanitizeUserForClient, checkRateLimit, logSecurityEvent } from '@/utils/secureAuthUtils';

export const secureGetStaffByUsername = async (username: string) => {
  // Input validation
  if (!validateInput.isValidUsername(username)) {
    logSecurityEvent('INVALID_USERNAME_ATTEMPT', { username: username.slice(0, 10) });
    return { staff: null, error: 'Tên đăng nhập không hợp lệ' };
  }

  // Rate limiting
  if (!checkRateLimit(`auth_${username}`, 5, 15 * 60 * 1000)) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', { username });
    return { staff: null, error: 'Quá nhiều lần thử. Vui lòng thử lại sau 15 phút' };
  }

  try {
    const { data: staff, error: fetchError } = await supabase
      .from('staff')
      .select('*')
      .ilike('username', username.toLowerCase().trim())
      .maybeSingle();

    if (fetchError) {
      logSecurityEvent('DATABASE_ERROR', { error: fetchError.message });
      return { staff: null, error: 'Lỗi hệ thống' };
    }

    return { staff: sanitizeUserForClient(staff), error: null };
  } catch (error) {
    logSecurityEvent('UNEXPECTED_ERROR', { error: (error as Error).message });
    return { staff: null, error: 'Lỗi hệ thống' };
  }
};

export const secureValidatePassword = async (password: string, storedPassword: string): Promise<boolean> => {
  if (!password || !storedPassword) {
    return false;
  }

  try {
    return await bcrypt.compare(password, storedPassword);
  } catch (error) {
    logSecurityEvent('PASSWORD_VALIDATION_ERROR', { error: (error as Error).message });
    return false;
  }
};

export const secureHandleFailedLogin = async (username: string, currentAttempts: number = 0): Promise<LoginResult> => {
  const newAttempts = currentAttempts + 1;
  
  logSecurityEvent('FAILED_LOGIN_ATTEMPT', { username, attemptCount: newAttempts });
  
  if (newAttempts >= 3) {
    try {
      const { error } = await supabase
        .from('staff')
        .update({
          account_status: 'locked',
          failed_login_attempts: newAttempts,
          last_failed_login: new Date().toISOString(),
          locked_at: new Date().toISOString()
        })
        .ilike('username', username);
      
      if (error) {
        logSecurityEvent('ACCOUNT_LOCK_ERROR', { username, error: error.message });
      } else {
        logSecurityEvent('ACCOUNT_LOCKED', { username });
      }
    } catch (error) {
      logSecurityEvent('ACCOUNT_LOCK_EXCEPTION', { username, error: (error as Error).message });
    }
    
    return { error: 'Tài khoản đã bị khóa do nhập sai mật khẩu quá nhiều lần' };
  } else {
    try {
      await supabase
        .from('staff')
        .update({
          failed_login_attempts: newAttempts,
          last_failed_login: new Date().toISOString()
        })
        .ilike('username', username);
    } catch (error) {
      logSecurityEvent('FAILED_ATTEMPT_UPDATE_ERROR', { username, error: (error as Error).message });
    }
    
    const remainingAttempts = 3 - newAttempts;
    return { error: `Mật khẩu không đúng. Còn ${remainingAttempts} lần thử...` };
  }
};

export const secureResetFailedLoginAttempts = async (username: string): Promise<void> => {
  try {
    await supabase
      .from('staff')
      .update({
        failed_login_attempts: 0,
        last_failed_login: null
      })
      .ilike('username', username);
      
    logSecurityEvent('LOGIN_SUCCESS', { username });
  } catch (error) {
    logSecurityEvent('RESET_ATTEMPTS_ERROR', { username, error: (error as Error).message });
  }
};
