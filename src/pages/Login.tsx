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
import { useDebounce } from '@/hooks/useDebounce';
import { checkAccountStatus } from '@/services/secureAuthService';

const Login = () => {
  const navigate = useNavigate();
  const { user, login, loading } = useSecureAuth();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAccountLocked, setIsAccountLocked] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const debouncedUsername = useDebounce(credentials.username, 500);

  useEffect(() => {
    const verifyAccountStatus = async () => {
      if (!debouncedUsername) {
        if (isAccountLocked) handleTryAnotherAccount();
        return;
      }
      
      const { isLocked, error: checkError } = await checkAccountStatus(debouncedUsername);

      if (checkError) {
        console.error('Status check failed:', checkError);
        return;
      }

      if (isLocked) {
        setError('Tài khoản của bạn đã bị khóa. Hãy liên hệ Admin để được mở khóa.');
        setIsAccountLocked(true);
        setShowForm(false);
      } else {
        if (isAccountLocked) handleTryAnotherAccount();
      }
    };

    verifyAccountStatus();
  }, [debouncedUsername]);

  useEffect(() => {
    if (!loading && user) {
      if (user.department === "NQ") {
        navigate('/daily-report');
      } else {
        navigate('/asset-entry');
      }
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setIsAccountLocked(false);
    setShowForm(true);

    try {
      const result = await login(credentials.username.toLowerCase().trim(), credentials.password);
      
      if (result.error) {
        setError(result.error);
        if (typeof result.error === 'string' && result.error.includes('khóa')) {
          setIsAccountLocked(true);
          setShowForm(false);
        }
      }
    } catch (error) {
      console.error('💥 Login submit error:', error);
      setError('Đã xảy ra lỗi trong quá trình đăng nhập');
    }

    setIsLoading(false);
  };

  const handleTryAnotherAccount = () => {
    setCredentials({ username: '', password: '' });
    setShowForm(true);
    setIsAccountLocked(false);
    setError('');
  };

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
            {error && showForm && (
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