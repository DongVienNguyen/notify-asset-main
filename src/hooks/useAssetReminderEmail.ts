import { supabase } from '@/integrations/supabase/client';
import { sendAssetNotificationEmail } from '@/services/emailService';
import { isDayMonthDueOrOverdue } from '@/utils/dateUtils';

interface StaffData {
  cbkh: { ten_nv: string; email: string }[];
  cbqln: { ten_nv: string; email: string }[];
}

interface ShowMessageParams {
  type: 'success' | 'error' | 'info';
  text: string;
}

export const useAssetReminderEmail = (
  staff: StaffData,
  loadData: () => void,
  showMessage: (params: ShowMessageParams) => void
) => {
  const getEmailTemplate = (ten_ts: string, ngay_den_han: string, cbkh: string, cbqln: string) => {
    const recipients = [cbkh, cbqln].filter(Boolean).map(name => `bạn ${name}`).join(' và ');
    return `Xin chào ${recipients}, có tài sản ${ten_ts} sắp đến hạn trả vào ngày ${ngay_den_han}, các bạn hãy hoàn thành trả tài sản trước 16 giờ 00 ngày ${ngay_den_han}. Trân trọng cám ơn.`;
  };

  const sendSingleReminder = async (reminder: any) => {
    if (!isDayMonthDueOrOverdue(reminder.ngay_den_han)) {
      showMessage({ type: 'info', text: "Nhắc nhở này chưa đến hạn" });
      return;
    }

    try {
      const recipients: string[] = [];
      if (reminder.cbkh) {
        const member = staff.cbkh.find(m => m.ten_nv === reminder.cbkh);
        if (member) recipients.push(`${member.email}.hvu@vietcombank.com.vn`);
      }
      if (reminder.cbqln) {
        const member = staff.cbqln.find(m => m.ten_nv === reminder.cbqln);
        if (member) recipients.push(`${member.email}.hvu@vietcombank.com.vn`);
      }

      if (recipients.length === 0) {
        showMessage({ type: 'error', text: "Không tìm thấy người nhận email" });
        return;
      }

      const subject = `Nhắc nhở tài sản đến hạn: ${reminder.ten_ts}`;
      const content = getEmailTemplate(reminder.ten_ts, reminder.ngay_den_han, reminder.cbkh, reminder.cbqln);
      const emailResult = await sendAssetNotificationEmail(recipients, subject, content);

      if (emailResult.success) {
        // Move reminder to sent table
        await supabase.from('sent_asset_reminders').insert([{ ...reminder, sent_date: new Date().toISOString().split('T')[0], is_sent: true }]);
        await supabase.from('asset_reminders').delete().eq('id', reminder.id);
        showMessage({ type: 'success', text: "Đã gửi email và chuyển sang danh sách đã gửi" });
        loadData();
      } else {
        throw new Error(emailResult.error);
      }
    } catch (error: any) {
      showMessage({ type: 'error', text: `Không thể gửi email: ${error.message}` });
    }
  };

  const sendReminders = async (reminders: any[]) => {
    const dueReminders = reminders.filter(r => isDayMonthDueOrOverdue(r.ngay_den_han));
    if (dueReminders.length === 0) {
      showMessage({ type: 'info', text: "Không có nhắc nhở nào đến hạn" });
      return;
    }

    let successCount = 0;
    for (const reminder of dueReminders) {
      // Re-using single reminder logic for simplicity
      await sendSingleReminder(reminder);
      successCount++; // Assuming it succeeds for now, as sendSingleReminder handles its own messages
    }

    if (successCount > 0) {
        // Message is handled in sendSingleReminder, so no global message needed here
    }
  };

  return {
    isDateDueOrOverdue: isDayMonthDueOrOverdue,
    sendSingleReminder,
    sendReminders
  };
};