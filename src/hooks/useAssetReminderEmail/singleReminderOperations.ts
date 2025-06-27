
import { supabase } from '@/integrations/supabase/client';
import { sendAssetNotificationEmail } from '@/services/emailService';
import { isDateDueOrOverdue } from './dateUtils';
import { getEmailTemplate } from './emailTemplates';
import { getRecipients } from './recipientUtils';

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

// Staff Member interface
interface StaffMember {
  id: string;
  ten_nv: string;
  email: string;
}

interface Staff {
  cbkh: StaffMember[];
  cbqln: StaffMember[];
}

export const sendSingleReminder = async (
  reminder: AssetReminder,
  staff: Staff,
  toast: any,
  loadData: () => Promise<void>
) => {
  try {
    if (!isDateDueOrOverdue(reminder.ngay_den_han)) {
      toast({
        title: "Thông báo",
        description: "Nhắc nhở tài sản này chưa đến hạn",
        variant: "destructive",
      });
      return;
    }

    const recipients = getRecipients(staff, reminder.cbkh, reminder.cbqln);

    if (recipients.length === 0) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy người nhận email",
        variant: "destructive",
      });
      return;
    }

    const subject = `Nhắc nhở tài sản đến hạn: ${reminder.ten_ts}`;
    const content = getEmailTemplate(
      reminder.ten_ts,
      reminder.ngay_den_han,
      reminder.cbkh || 'Chưa chọn',
      reminder.cbqln || 'Chưa chọn'
    );

    console.log(`Sending asset email for reminder ${reminder.id}:`, {
      recipients,
      subject,
      content
    });

    const emailResult = await sendAssetNotificationEmail(recipients, subject, content);
    
    if (emailResult.success) {
      // Move to sent_asset_reminders table
      const sentData = {
        ten_ts: reminder.ten_ts,
        ngay_den_han: reminder.ngay_den_han,
        cbkh: reminder.cbkh,
        cbqln: reminder.cbqln,
        is_sent: true,
        sent_date: new Date().toISOString().split('T')[0]
      };

      console.log('Moving sent asset reminder to sent_asset_reminders:', sentData);

      const { error: insertError } = await supabase
        .from('sent_asset_reminders')
        .insert([sentData]);

      if (insertError) {
        console.error('Error inserting to sent_asset_reminders:', insertError);
        throw insertError;
      }

      // Remove from main table after successful insert
      const { error: deleteError } = await supabase
        .from('asset_reminders')
        .delete()
        .eq('id', reminder.id);

      if (deleteError) {
        console.error('Error deleting from asset_reminders:', deleteError);
        throw deleteError;
      }

      console.log(`Successfully moved asset reminder ${reminder.id} to sent table`);

      toast({
        title: "Thành công",
        description: "Đã gửi email nhắc nhở tài sản và chuyển sang danh sách đã gửi",
      });

      // Reload data to reflect changes
      loadData();
    } else {
      console.error(`Failed to send asset email for reminder ${reminder.id}:`, emailResult.error);
      toast({
        title: "Lỗi",
        description: `Không thể gửi email: ${emailResult.error}`,
        variant: "destructive",
      });
    }
  } catch (error: any) {
    console.error('Error sending single asset reminder:', error);
    toast({
      title: "Lỗi",
      description: `Không thể gửi email nhắc nhở tài sản: ${error.message}`,
      variant: "destructive",
    });
  }
};
