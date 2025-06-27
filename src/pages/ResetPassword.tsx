
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to lowercase and trim whitespace for consistent handling
    const value = e.target.value.toLowerCase().trim();
    setEmail(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Validate email format
      if (!email.endsWith('.hvu@vietcombank.com.vn')) {
        setMessage({
          type: 'error',
          text: 'Email phải có định dạng: tên.hvu@vietcombank.com.vn'
        });
        setIsLoading(false);
        return;
      }

      // Extract username from email (case-insensitive)
      const username = email.replace('.hvu@vietcombank.com.vn', '');
      
      console.log('🔍 Looking for staff with username:', username);
      
      // Check if staff exists using case-insensitive search
      const { data: staff, error: dbError } = await supabase
        .from('staff')
        .select('username')
        .ilike('username', username)
        .maybeSingle();

      console.log('📊 Staff lookup result:', { staff, error: dbError });

      if (dbError) {
        console.error('❌ Database error:', dbError);
        setMessage({
          type: 'error',
          text: 'Đã xảy ra lỗi trong quá trình kiểm tra thông tin'
        });
        setIsLoading(false);
        return;
      }

      if (!staff) {
        setMessage({
          type: 'error',
          text: 'Không tìm thấy nhân viên với email này'
        });
        setIsLoading(false);
        return;
      }

      // Generate new password
      const newPassword = Math.floor(100000 + Math.random() * 900000).toString();

      // Simulate sending email (in real app, this would call Supabase edge function)
      console.log('Sending email to:', email);
      console.log('New password:', newPassword);

      setMessage({
        type: 'success',
        text: 'Mật khẩu mới đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.'
      });

      // Reset form
      setEmail('');
    } catch (error) {
      console.error('💥 Reset password error:', error);
      setMessage({
        type: 'error',
        text: 'Đã xảy ra lỗi trong quá trình reset mật khẩu'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Đặt lại mật khẩu</h1>
          <p className="text-gray-600 mt-2">Nhập email của bạn để nhận mật khẩu mới.</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl text-center">Đặt lại mật khẩu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {message.text && (
              <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Địa chỉ Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Nhập đầy đủ email: abc.bcd@abc.com.vn"
                    value={email}
                    onChange={handleEmailChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Đang gửi...' : 'Reset Mật khẩu'}
              </Button>
            </form>

            <div className="text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Quay lại trang Đăng nhập
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
