import React from 'react';
import { Bug, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { AuthUser } from '@/types/auth'; // Import AuthUser

interface SubmitButtonsProps {
  isRestrictedTime: boolean;
  isFormValid: boolean;
  isLoading: boolean;
  user: AuthUser | null; // Use AuthUser here for consistency
  onClear: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onTestEmail: () => void;
}

const SubmitButtons = ({
  isRestrictedTime,
  isFormValid,
  isLoading,
  user,
  onClear,
  onSubmit,
  onTestEmail
}: SubmitButtonsProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex space-x-4">
        {!isRestrictedTime ? (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={onClear}
            >
              Clear
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={!isFormValid || isLoading}
              onClick={onSubmit}
            >
              {isLoading ? 'Đang gửi...' : 'Gửi thông báo'}
            </Button>
          </>
        ) : (
          <div className="text-orange-600 font-medium">
            Không thể lưu dữ liệu trong giờ nghỉ
          </div>
        )}
      </div>
      
      {/* Admin Test Email and Error Reporting */}
      <div className="flex space-x-4">
        {user?.role === 'admin' && (
          <Button
            type="button"
            variant="outline"
            onClick={onTestEmail}
            disabled={!user?.username || isLoading}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <TestTube className="w-4 h-4 mr-2" />
            {isLoading ? 'Đang test...' : 'Test Email'}
          </Button>
        )}
        
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/error-report')}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          <Bug className="w-4 h-4 mr-2" />
          Báo lỗi và gửi hình lỗi
        </Button>
      </div>
    </div>
  );
};

export default SubmitButtons;