
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginFormProps {
  credentials: { username: string; password: string };
  setCredentials: React.Dispatch<React.SetStateAction<{ username: string; password: string }>>;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const LoginForm = ({ credentials, setCredentials, onSubmit, isLoading }: LoginFormProps) => {
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to lowercase and trim whitespace for consistent handling
    const value = e.target.value.toLowerCase().trim();
    setCredentials({...credentials, username: value});
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Tên đăng nhập</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="username"
            type="text"
            placeholder="Nhập tên đăng nhập"
            value={credentials.username}
            onChange={handleUsernameChange}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="password"
            type="password"
            placeholder="Nhập mật khẩu"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="text-right">
        <Link 
          to="/reset-password" 
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          Reset mật khẩu
        </Link>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-blue-600 hover:bg-blue-700"
        disabled={isLoading}
      >
        {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </Button>
    </form>
  );
};
