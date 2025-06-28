import { supabase } from '@/integrations/supabase/client';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.error('Service Worker not supported');
    return;
  }
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered with scope:', registration.scope);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
}

export async function requestNotificationPermission() {
  if (!('Notification' in window) || !('PushManager' in window)) {
    alert('Trình duyệt này không hỗ trợ Thông báo đẩy.');
    return null;
  }
  const permission = await Notification.requestPermission();
  return permission;
}

async function saveSubscription(subscription: PushSubscription, username: string) {
  if (!username) {
    console.error("Cannot save subscription, username not provided.");
    return;
  }

  // Remove old subscription if exists, then insert new one
  const { error: deleteError } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('username', username);

  if (deleteError) {
    console.error('Error removing old push subscription:', deleteError);
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .insert({ username: username, subscription: subscription as any });

  if (error) {
    console.error('Error saving push subscription:', error);
  } else {
    console.log('Push subscription saved successfully.');
  }
}

export async function subscribeUserToPush(username: string) {
  if (!VAPID_PUBLIC_KEY) {
    console.error('VITE_VAPID_PUBLIC_KEY is not defined. Cannot subscribe to push notifications.');
    alert('Tính năng thông báo đẩy chưa được cấu hình trên máy chủ.');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
    console.log('User is subscribed:', subscription);
    await saveSubscription(subscription, username);
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe the user: ', error);
    if ((error as Error).name === 'NotAllowedError') {
        alert('Bạn đã chặn quyền nhận thông báo. Vui lòng thay đổi trong cài đặt trình duyệt.');
    } else {
        alert('Không thể đăng ký nhận thông báo. Vui lòng thử lại.');
    }
  }
}