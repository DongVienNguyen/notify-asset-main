import { useState, useEffect, createContext, useContext } from 'react';
import { AuthContextType, Staff, LoginResult } from '@/types/auth';
import { getStoredUser, storeUser, removeStoredUser } from '@/utils/authUtils';
import { 
  secureLoginUser // Import the new login function
} from '@/services/secureAuthService';
import { setCurrentUserContext } from '@/utils/otherAssetUtils';
import { validateInput } from '@/utils/inputValidation';
import { logSecurityEvent } from '@/utils/secureAuthUtils';

const SecureAuthContext = createContext<AuthContextType | undefined>(undefined);

export function SecureAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      if (storedUser.username && storedUser.role) {
        setUser(storedUser);
        setCurrentUserContext(storedUser);
      } else {
        removeStoredUser();
        logSecurityEvent('INVALID_STORED_USER_DATA');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<LoginResult> => {
    // Client-side input validation (basic)
    const usernameValidation = validateInput.validateText(username, 30);
    if (!usernameValidation.isValid) {
      return { error: usernameValidation.error || 'Tên đăng nhập không hợp lệ' };
    }

    const passwordValidation = validateInput.validateText(password, 100);
    if (!passwordValidation.isValid) {
      return { error: 'Mật khẩu không hợp lệ' };
    }

    try {
      // Call the secure login function which uses the Edge Function
      const { user: loggedInUser, error: loginError } = await secureLoginUser(username, password);

      if (loginError) {
        return { error: loginError };
      }

      if (loggedInUser) {
        // Login successful
        await setCurrentUserContext(loggedInUser); // Set user context for RLS
        setUser(loggedInUser);
        storeUser(loggedInUser);
        return { error: null };
      } else {
        // This case should ideally not be reached if loginError is null
        return { error: 'Đăng nhập thất bại không xác định' };
      }
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