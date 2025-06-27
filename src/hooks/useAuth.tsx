
import { useState, useEffect, createContext, useContext } from 'react';
import { AuthContextType, Staff, LoginResult } from '@/types/auth';
import { getStoredUser, storeUser, removeStoredUser, createStaffUser } from '@/utils/authUtils';
import { 
  getStaffByUsername, 
  validatePassword, 
  handleFailedLogin, 
  resetFailedLoginAttempts 
} from '@/services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const storedUser = getStoredUser();
    if (storedUser) {
      console.log('Found stored user:', storedUser);
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<LoginResult> => {
    try {
      console.log('🔐 Starting login process for username:', username);
      
      // Convert username to lowercase and trim for consistent handling
      const normalizedUsername = username.toLowerCase().trim();
      
      // Get the staff member directly using case-insensitive search
      const { staff, error: fetchError } = await getStaffByUsername(normalizedUsername);

      if (fetchError) {
        console.error('❌ Fetch error:', fetchError);
        return { error: fetchError };
      }

      if (!staff) {
        console.log('❌ No staff found with username:', normalizedUsername);
        return { error: 'Tên đăng nhập hoặc mật khẩu không đúng' };
      }

      console.log('✅ Staff found:', { 
        username: staff.username, 
        role: staff.role, 
        department: staff.department,
        account_status: staff.account_status 
      });

      if (staff.account_status === 'locked') {
        console.log('🔒 Account is locked');
        return { error: 'Tài khoản đã bị khóa' };
      }

      // Validate password using bcrypt
      const isPasswordValid = await validatePassword(password, staff.password);
      console.log('🔑 Password validation result:', isPasswordValid);

      if (!isPasswordValid) {
        console.log('❌ Invalid password, handling failed login');
        return await handleFailedLogin(staff.username, staff.failed_login_attempts || 0);
      }

      // Login successful - reset failed attempts
      console.log('✅ Password valid, resetting failed attempts');
      await resetFailedLoginAttempts(staff.username);

      const userData = createStaffUser(staff);
      console.log('✅ Creating user data:', userData);

      setUser(userData);
      storeUser(userData);
      
      console.log('🎉 Login successful!');
      return { error: null };
    } catch (error) {
      console.error('💥 Login error:', error);
      return { error: 'Đã xảy ra lỗi trong quá trình đăng nhập' };
    }
  };

  const logout = () => {
    console.log('👋 Logging out user');
    setUser(null);
    removeStoredUser();
    // Force a complete page reload to clear all state
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
