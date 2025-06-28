import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const { user } = useSecureAuth();
  const queryClient = useQueryClient();

  const fetchNotifications = async () => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_username', user.username)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    return data || [];
  };

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications', user?.username],
    queryFn: fetchNotifications,
    enabled: !!user,
    refetchInterval: 300000, // 5 minutes
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    queryClient.invalidateQueries({ queryKey: ['notifications', user?.username] });
  };

  const markAllAsRead = async () => {
    if (!user) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_username', user.username)
      .eq('is_read', false);
    queryClient.invalidateQueries({ queryKey: ['notifications', user?.username] });
  };

  const deleteAllNotifications = async () => {
    if (!user) return;
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả thông báo?')) {
      await supabase
        .from('notifications')
        .delete()
        .eq('recipient_username', user.username);
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.username] });
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Thông báo</span>
          <div className="space-x-1">
            <Button variant="ghost" size="icon" onClick={markAllAsRead} title="Đánh dấu tất cả đã đọc">
              <CheckCheck className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={deleteAllNotifications} title="Xóa tất cả thông báo">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <DropdownMenuItem disabled>Không có thông báo</DropdownMenuItem>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`flex flex-col items-start p-2 cursor-pointer ${!notification.is_read ? 'bg-blue-50' : ''}`}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
            >
              <div className="flex items-center justify-between w-full">
                <h4 className="font-medium text-sm">{notification.title}</h4>
                {!notification.is_read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0"></div>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1 whitespace-normal">{notification.message}</p>
              <span className="text-xs text-gray-400 mt-2">
                {new Date(notification.created_at).toLocaleString('vi-VN')}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}