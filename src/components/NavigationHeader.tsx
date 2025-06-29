import React, { useState } from 'react';
import { Package, Menu, Bell, User, LogOut, Key, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Link, useNavigate } from 'react-router-dom';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { NotificationBell } from './NotificationBell';
import { requestNotificationPermission, subscribeUserToPush } from '@/utils/pushNotificationUtils';

export function NavigationHeader() {
  const { user, logout } = useSecureAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleEnableNotifications = async () => {
    if (!user) return;
    const permission = await requestNotificationPermission();
    if (permission === 'granted') {
      await subscribeUserToPush(user.username);
      alert('Đã bật thông báo đẩy thành công! Bạn sẽ nhận được thông báo ngay cả khi đã đóng ứng dụng.');
    } else {
      alert('Bạn đã không cấp quyền nhận thông báo. Tính năng sẽ không hoạt động.');
    }
  };

  const allMenuItems = [
    { label: 'Thông báo Mượn/Xuất', path: '/asset-entry', icon: Package },
    { label: 'Danh sách TS cần lấy', path: '/daily-report', icon: Package },
    { label: 'Nhắc nhở Tài sản đến hạn', path: '/asset-reminders', icon: Package },
    { label: 'Nhắc nhở Duyệt CRC', path: '/crc-reminders', icon: Package },
    { label: 'Báo cáo tài sản đã mượn', path: '/borrow-report', icon: Package },
    { label: 'Tài sản, thùng khác gửi kho', path: '/other-assets', icon: Package },
    { label: 'Quản lý dữ liệu', path: '/data-management', icon: Package },
  ];

  const getVisibleMenuItems = () => {
    if (!user) return [];
    if (user.role === 'admin') {
      return allMenuItems;
    }

    if (user.role === 'user') {
      const standardUserDepartments = ['QLN', 'CMT8', 'NS', 'ĐS', 'LĐH', 'DVKH'];
      if (standardUserDepartments.includes(user.department)) {
        return allMenuItems.filter(item => 
          item.path === '/asset-entry' || item.path === '/daily-report'
        );
      }

      if (user.department === 'NQ') {
        return allMenuItems.filter(item => item.path !== '/data-management');
      }
    }
    return [];
  };

  const visibleMenuItems = getVisibleMenuItems();

  const handleMenuItemClick = () => {
    setIsMenuOpen(false);
  };

  if (!user) return null;

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Menu className="w-4 h-4 mr-2" />
                    Menu
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-white">
                  {visibleMenuItems.map((item) => (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link to={item.path} className="w-full flex items-center space-x-2">
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu - Updated to slide from left */}
            <div className="md:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full max-w-xs">
                  <SheetHeader className="pb-4">
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-2 pb-4">
                    {visibleMenuItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={handleMenuItemClick}
                        className="flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Right side - Notifications and User Menu */}
          <div className="flex items-center space-x-4">
            <NotificationBell />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-green-600 text-white">
                      {user?.staff_name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.staff_name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.department} - {user?.role === 'admin' ? 'Quản trị' : 'Nhân viên'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleEnableNotifications}>
                  <Smartphone className="mr-2 h-4 w-4" />
                  <span>Bật thông báo đẩy</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/reset-password" className="flex items-center">
                    <Key className="mr-2 h-4 w-4" />
                    <span>Đổi mật khẩu</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}