import { useState, useEffect, createContext, useContext } from 'react';
import { AuthContextType, Staff, LoginResult } from '@/types/auth';
import { getStoredUser, storeUser, removeStoredUser } from '@/utils/authUtils';
import { 
  secureGetStaffByUsername, 
  secureValidatePassword, 
  secureHandleFailedLogin, 
  secureResetFailedLoginAttempts 
} from '@/services/secureAuthService';
import { setCurrentUserContext } from '@/utils/otherAssetUtils';
import { validateInput } from '@/utils/inputValidation';
import { logSecurityEvent } from '@/utils/secureAuthUtils';
import { supabase } from '@/integrations/supabase/client';

const SecureAuthContext = createContext<AuthContextType | undefined>(undefined);

export function SecureAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      // Validate stored user data
      if (storedUser.username && storedUser.role) {
        setUser(storedUser);
        // Set user context for database operations
        setCurrentUserContext(storedUser);
      } else {
        // Invalid stored data, remove it
        removeStoredUser();
        logSecurityEvent('INVALID_STORED_USER_DATA');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<LoginResult> => {
    // Input validation
    const usernameValidation = validateInput.validateText(username, 30);
    if (!usernameValidation.isValid) {
      return { error: usernameValidation.error || 'Tên đăng nhập không hợp lệ' };
    }

    const passwordValidation = validateInput.validateText(password, 100);
    if (!passwordValidation.isValid) {
      return { error: 'Mật khẩu không hợp lệ' };
    }

    try {
      const normalizedUsername = validateInput.sanitizeString(username.toLowerCase().trim());
      
      const { staff, error: fetchError } = await secureGetStaffByUsername(normalizedUsername);

      if (fetchError) {
        return { error: fetchError };
      }

      if (!staff) {
        logSecurityEvent('LOGIN_USER_NOT_FOUND', { username: normalizedUsername });
        return { error: 'Tên đăng nhập hoặc mật khẩu không đúng' };
      }

      if (staff.account_status === 'locked') {
        logSecurityEvent('LOGIN_LOCKED_ACCOUNT', { username: normalizedUsername });
        return { error: 'Tài khoản đã bị khóa' };
      }

      // Get full staff data for password validation
      const { data: fullStaff } = await supabase
        .from('staff')
        .select('password, failed_login_attempts')
        .ilike('username', normalizedUsername)
        .single();

      if (!fullStaff) {
        return { error: 'Lỗi hệ thống' };
      }

      const isPasswordValid = await secureValidatePassword(password, fullStaff.password);

      if (!isPasswordValid) {
        return await secureHandleFailedLogin(staff.username, fullStaff.failed_login_attempts || 0);
      }

      // Login successful
      await secureResetFailedLoginAttempts(staff.username);
      await setCurrentUserContext(staff);

      setUser(staff);
      storeUser(staff);
      
      return { error: null };
    } catch (error) {
      logSecurityEvent('LOGIN_EXCEPTION', { error: (error as Error).message });
      return { error: 'Đã xảy ra lỗi trong quá trình đăng nhập' };
    }
  };

  const logout = () => {
    logSecurityEvent('LOGOUT', { username: user?.username });
    setUser(null);
    removeStoredUser();
    window.location.href = '/login';
  };

  return (
    <SecureAuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </SecureAuthContext.Provider>
  );
}

export function useSecureAuth() {
  const context = useContext(SecureAuthContext);
  if (context === undefined) {
    throw new Error('useSecureAuth must be used within a SecureAuthProvider');
  }
  return context;
}
