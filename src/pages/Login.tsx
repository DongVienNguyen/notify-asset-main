
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { LoginHeader } from '@/components/LoginHeader';
import { LoginForm } from '@/components/LoginForm';
import { AccountLockedMessage } from '@/components/AccountLockedMessage';
import { DemoCredentials } from '@/components/DemoCredentials';

const Login = () => {
  const navigate = useNavigate();
  const { user, login, loading } = useAuth();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAccountLocked, setIsAccountLocked] = useState(false);
  const [showForm, setShowForm] = useState(true);

  // Test database connection on component mount
  useEffect(() => {
    const testDatabaseConnection = async () => {
      try {
        console.log('🔍 Testing database connection...');
        const { data, error } = await supabase
          .from('staff')
          .select('count')
          .limit(1);
        
        console.log('📊 Database connection test result:', { data, error });
        
        if (error) {
          console.error('❌ Database connection failed:', error);
          setError('Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau.');
        } else {
          console.log('✅ Database connection successful');
        }
      } catch (err) {
        console.error('💥 Database connection exception:', err);
        setError('Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau.');
      }
    };

    testDatabaseConnection();
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      console.log('🔄 User already logged in, redirecting...', user);
      if (user.department === "NQ") {
        navigate('/daily-report');
      } else {
        navigate('/asset-entry');
      }
    }
  }, [user, loading, navigate]);

  // Check account status when username changes
  useEffect(() => {
    if (credentials.username && credentials.username.length > 2) {
      const timer = setTimeout(() => {
        checkAccountStatus();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      // Reset states when username is empty
      setIsAccountLocked(false);
      setShowForm(true);
      setError('');
    }
  }, [credentials.username]);

  const checkAccountStatus = async () => {
    try {
      console.log('🔍 Checking account status for:', credentials.username);
      
      // Use case-insensitive search
      const { data: staff, error: dbError } = await supabase
        .from('staff')
        .select('account_status, username')
        .ilike('username', credentials.username)
        .maybeSingle();

      console.log('📊 Account status check result:', { staff, error: dbError });

      if (dbError) {
        console.error('❌ Error checking account status:', dbError);
        setIsAccountLocked(false);
        setShowForm(true);
        return;
      }

      if (staff && staff.account_status === 'locked') {
        console.log('🔒 Account is locked');
        setIsAccountLocked(true);
        setShowForm(false);
        setError('Tài khoản đã bị khóa do nhập sai mật khẩu quá nhiều lần.');
      } else {
        console.log('✅ Account is active or not found');
        setIsAccountLocked(false);
        setShowForm(true);
        // Only clear error if it's the account locked error
        if (typeof error === 'string' && error.includes('khóa')) {
          setError('');
        }
      }
    } catch (error) {
      console.error('💥 Error in checkAccountStatus:', error);
      // If user not found or other error, reset states
      setIsAccountLocked(false);
      setShowForm(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log('🚀 Login form submitted for:', credentials.username);
    console.log('🔍 Form data:', { 
      username: credentials.username, 
      passwordLength: credentials.password.length 
    });

    try {
      // Convert username to lowercase for consistent handling
      const result = await login(credentials.username.toLowerCase().trim(), credentials.password);
      
      console.log('📝 Login attempt result:', result);
      
      if (result.error) {
        setError(result.error);
        
        // Check if account was locked
        if (typeof result.error === 'string' && result.error.includes('khóa')) {
          setIsAccountLocked(true);
          setShowForm(false);
        }
      } else {
        console.log('🎉 Login successful, navigation will be handled by useEffect');
        // Login successful, navigation will be handled by useEffect
      }
    } catch (error) {
      console.error('💥 Login submit error:', error);
      setError('Đã xảy ra lỗi trong quá trình đăng nhập');
    }

    setIsLoading(false);
  };

  const handleTryAnotherAccount = () => {
    console.log('🔄 Trying another account');
    setCredentials({ username: '', password: '' });
    setShowForm(true);
    setIsAccountLocked(false);
    setError('');
  };

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra trạng thái đăng nhập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md space-y-8">
        <LoginHeader />

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl text-center">Thông tin đăng nhập</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {showForm ? (
              <LoginForm
                credentials={credentials}
                setCredentials={setCredentials}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            ) : (
              <AccountLockedMessage onTryAnotherAccount={handleTryAnotherAccount} />
            )}
          </CardContent>
        </Card>

        <DemoCredentials />
      </div>
    </div>
  );
};

export default Login;
