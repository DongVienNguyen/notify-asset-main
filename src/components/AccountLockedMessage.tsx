
import React from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccountLockedMessageProps {
  onTryAnotherAccount: () => void;
}

export const AccountLockedMessage = ({ onTryAnotherAccount }: AccountLockedMessageProps) => {
  return (
    <div className="text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
        <Lock className="w-8 h-8 text-red-600" />
      </div>
      <p className="text-gray-700 font-medium">Tài khoản đã bị khóa</p>
      <Button 
        variant="outline" 
        onClick={onTryAnotherAccount}
        className="w-full"
      >
        Thử tài khoản khác
      </Button>
    </div>
  );
};
