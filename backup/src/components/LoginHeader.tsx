
import React from 'react';
import { Package } from 'lucide-react';

export const LoginHeader = () => {
  return (
    <div className="text-center">
      <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
        <Package className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900">Đăng nhập</h1>
      <p className="text-gray-600 mt-2">Truy cập hệ thống quản lý tài sản kho</p>
    </div>
  );
};
