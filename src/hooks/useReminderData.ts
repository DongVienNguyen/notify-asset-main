
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Asset Reminder interface
interface AssetReminder {
  id: string;
  ten_ts: string;
  ngay_den_han: string;
  cbkh: string | null;
  cbqln: string | null;
  is_sent: boolean;
  created_at: string;
}

// Sent Asset Reminder interface
interface SentAssetReminder {
  id: string;
  ten_ts: string;
  ngay_den_han: string;
  cbkh: string | null;
  cbqln: string | null;
  is_sent: boolean;
  sent_date: string;
  created_at: string;
}

export const useReminderData = () => {
  const [reminders, setReminders] = useState<AssetReminder[]>([]);
  const [sentReminders, setSentReminders] = useState<SentAssetReminder[]>([]);
  const { toast } = useToast();

  const loadReminderData = async () => {
    try {
      console.log('Loading reminder data...');
      
      // Load reminders
      console.log('Loading asset reminders...');
      const { data: remindersData, error: remindersError } = await supabase
        .from('asset_reminders')
        .select('*')
        .order('ngay_den_han', { ascending: true });

      if (remindersError) {
        console.error('Asset Reminders query error:', remindersError);
        throw new Error(`Asset Reminders load error: ${remindersError.message}`);
      }

      console.log('Asset Reminders loaded:', remindersData?.length || 0, 'records');

      // Load sent reminders
      console.log('Loading sent asset reminders...');
      const { data: sentRemindersData, error: sentRemindersError } = await supabase
        .from('sent_asset_reminders')
        .select('*')
        .order('sent_date', { ascending: false });

      if (sentRemindersError) {
        console.error('Sent asset reminders query error:', sentRemindersError);
        throw new Error(`Sent asset reminders load error: ${sentRemindersError.message}`);
      }

      console.log('Sent asset reminders loaded:', sentRemindersData?.length || 0, 'records');

      setReminders(remindersData || []);
      setSentReminders(sentRemindersData || []);

      return { remindersData, sentRemindersData };
    } catch (error: any) {
      console.error('Error loading reminder data:', error);
      setReminders([]);
      setSentReminders([]);
      toast({
        title: "Lỗi",
        description: `Không thể tải dữ liệu nhắc nhở: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    reminders,
    setReminders,
    sentReminders,
    setSentReminders,
    loadReminderData
  };
};
