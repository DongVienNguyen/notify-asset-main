import { supabase } from '@/integrations/supabase/client';

interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

export async function sendPushNotification(username: string, payload: PushPayload) {
  // Do not send to self
  const userStr = localStorage.getItem('currentUser');
  if (userStr) {
    const currentUser = JSON.parse(userStr);
    if (currentUser.username === username) {
      console.log("Skipping push notification to self.");
      return;
    }
  }

  console.log(`Attempting to send push notification to: ${username}`);
  const { data, error } = await supabase.functions.invoke('send-push-notification', {
    body: { username, payload },
  });

  if (error) {
    console.error(`Error sending push notification to ${username}:`, error);
    return { success: false, error: error.message };
  }

  console.log('Push notification function invoked:', data);
  return { success: true, data };
}