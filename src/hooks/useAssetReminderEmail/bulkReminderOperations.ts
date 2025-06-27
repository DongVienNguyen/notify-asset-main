
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

export const sendReminders = async (
  reminders: AssetReminder[],
  staff: Staff,
  toast: any,
  loadData: () => Promise<void>
) => {
  try {
    // Get reminders that are due or overdue (not just today)
    const dueReminders = reminders.filter(reminder => isDateDueOrOverdue(reminder.ngay_den_han));
    
    if (dueReminders.length === 0) {
      toast({
        title: "Thông báo",
        description: "Không có nhắc nhở tài sản nào đến hạn hoặc quá hạn",
      });
      return;
    }

    let sentCount = 0;
    const sentReminders = [];

    // Process each reminder one by one from top to bottom
    for (const reminder of dueReminders) {
      const recipients = getRecipients(staff, reminder.cbkh, reminder.cbqln);

      // Only send email if there are recipients
      if (recipients.length > 0) {
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
          sentCount++;
          sentReminders.push(reminder);
          console.log(`Asset Email sent successfully for reminder ${reminder.id}`);
        } else {
          console.error(`Failed to send asset email for reminder ${reminder.id}:`, emailResult.error);
        }
      } else {
        console.log(`No recipients found for asset reminder ${reminder.id}, skipping email`);
      }
    }

    // Move sent reminders to sent_asset_reminders table
    if (sentReminders.length > 0) {
      const sentData = sentReminders.map(reminder => ({
        ten_ts: reminder.ten_ts,
        ngay_den_han: reminder.ngay_den_han,
        cbkh: reminder.cbkh,
        cbqln: reminder.cbqln,
        is_sent: true,
        sent_date: new Date().toISOString().split('T')[0]
      }));

      console.log('Moving sent asset reminders to sent_asset_reminders:', sentData);

      const { error: insertError } = await supabase
        .from('sent_asset_reminders')
        .insert(sentData);

      if (insertError) {
        console.error('Error inserting to sent_asset_reminders:', insertError);
        throw insertError;
      }

      // Remove from main table after successful insert
      const sentIds = sentReminders.map(r => r.id);
      const { error: deleteError } = await supabase
        .from('asset_reminders')
        .delete()
        .in('id', sentIds);

      if (deleteError) {
        console.error('Error deleting from asset_reminders:', deleteError);
        throw deleteError;
      }

      console.log(`Successfully moved ${sentReminders.length} asset reminders to sent table`);
    }

    toast({
      title: "Thành công",
      description: `Đã gửi ${sentCount} email nhắc nhở tài sản và chuyển sang danh sách đã gửi`,
    });

    // Reload data to reflect changes
    loadData();
  } catch (error: any) {
    console.error('Error sending asset reminders:', error);
    toast({
      title: "Lỗi",
      description: `Không thể gửi email nhắc nhở tài sản: ${error.message}`,
      variant: "destructive",
    });
  }
};
