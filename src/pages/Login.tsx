import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { supabase } from '@/integrations/supabase/client';
import { LoginHeader } from '@/components/LoginHeader';
import { LoginForm } from '@/components/LoginForm';
import { AccountLockedMessage } from '@/components/AccountLockedMessage';
import { DemoCredentials } from '@/components/DemoCredentials';

const Login = () => {
  const navigate = useNavigate();
  const { user, login, loading } = useSecureAuth();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAccountLocked, setIsAccountLocked] = useState(false);
  const [showForm, setShowForm] = useState(true);

  // Test database connection on component mount (can keep this as a general health check)
  useEffect(() => {
    const testDatabaseConnection = async () => {
      try {
        console.log('🔍 Testing database connection...');
        // This is a simple count, less likely to hit RLS issues than full select,
        // but still good to monitor.
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

  // Removed the checkAccountStatus useEffect and function
  // The login function (via Edge Function) will handle account locking status

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setIsAccountLocked(false); // Reset lock status on new attempt
    setShowForm(true); // Always show form initially for new attempt

    console.log('🚀 Login form submitted for:', credentials.username);
    console.log('🔍 Form data:', { 
      username: credentials.username, 
      passwordLength: credentials.password.length 
    });

    try {
      const result = await login(credentials.username.toLowerCase().trim(), credentials.password);
      
      console.log('📝 Login attempt result:', result);
      
      if (result.error) {
        setError(result.error);
        
        // Check if account was locked based on the error message from the Edge Function
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