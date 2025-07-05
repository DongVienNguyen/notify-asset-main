import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { sendAssetReminderEmail } from '@/services/notifications/assetNotificationService'; // Corrected import path
import { StaffMember, AssetReminder, Staff } from '@/types/staff'; // Corrected import

export const useAssetReminderEmail = (staff: Staff, loadData: () => Promise<void>, showMessage: (params: { type: 'success' | 'error' | 'info'; text: string }) => void) => {
  const [isSending, setIsSending] = useState(false);

  const isDateDueOrOverdue = (dateString: string): boolean => {
    const [day, month] = dateString.split('-').map(Number);
    const today = new Date();
    const currentYear = today.getFullYear();
    const reminderDate = new Date(currentYear, month - 1, day);

    // If the reminder date has already passed this year, check for next year
    if (reminderDate < today && (today.getMonth() > month - 1 || (today.getMonth() === month - 1 && today.getDate() > day))) {
      reminderDate.setFullYear(currentYear + 1);
    }

    // Set both dates to start of day for accurate comparison
    today.setHours(0, 0, 0, 0);
    reminderDate.setHours(0, 0, 0, 0);

    return reminderDate <= today;
  };

  const sendSingleReminder = async (reminder: AssetReminder): Promise<boolean> => {
    setIsSending(true);
    try {
      const cbkhUser = staff.cbkh.find(s => s.ten_nv === reminder.cbkh);
      const cbqlnUser = staff.cbqln.find(s => s.ten_nv === reminder.cbqln);

      const recipientEmails: string[] = [];
      if (cbkhUser?.email) recipientEmails.push(cbkhUser.email);
      if (cbqlnUser?.email) recipientEmails.push(cbqlnUser.email);

      if (recipientEmails.length === 0) {
        showMessage({ type: 'error', text: `Không tìm thấy email người nhận cho nhắc nhở "${reminder.ten_ts}".` });
        return false;
      }

      const emailSubject = `Nhắc nhở tài sản đến hạn: ${reminder.ten_ts}`;
      const emailBody = `Tài sản "${reminder.ten_ts}" có ngày đến hạn là ${reminder.ngay_den_han}. Vui lòng kiểm tra và xử lý.`;

      const emailResult = await sendAssetReminderEmail(recipientEmails, emailSubject, emailBody);

      if (emailResult.success) {
        // Mark as sent and record in sent_asset_reminders
        await supabase.from('asset_reminders').update({ is_sent: true }).eq('id', reminder.id);
        await supabase.from('sent_asset_reminders').insert({
          ten_ts: reminder.ten_ts,
          ngay_den_han: reminder.ngay_den_han,
          cbqln: reminder.cbqln,
          cbkh: reminder.cbkh,
          is_sent: true,
          sent_date: format(new Date(), 'yyyy-MM-dd') // Record actual sent date
        });
        showMessage({ type: 'success', text: `Đã gửi nhắc nhở cho "${reminder.ten_ts}" thành công.` });
        await loadData();
        return true;
      } else {
        showMessage({ type: 'error', text: `Không thể gửi nhắc nhở cho "${reminder.ten_ts}": ${emailResult.error}` });
        return false;
      }
    } catch (error: any) {
      console.error('Error sending single reminder:', error);
      showMessage({ type: 'error', text: `Lỗi khi gửi nhắc nhở cho "${reminder.ten_ts}": ${error.message}` });
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const sendReminders = async (remindersToSend: AssetReminder[]): Promise<boolean> => {
    if (remindersToSend.length === 0) {
      showMessage({ type: 'info', text: "Không có nhắc nhở nào đến hạn để gửi." });
      return true; // No reminders to send, so it's "successful" in that sense
    }

    setIsSending(true);
    let allSuccess = true;
    for (const reminder of remindersToSend) {
      const success = await sendSingleReminder(reminder); // Reuse single send logic
      if (!success) {
        allSuccess = false;
      }
    }
    setIsSending(false);
    if (allSuccess) {
      showMessage({ type: 'success', text: `Đã gửi tất cả ${remindersToSend.length} nhắc nhở đến hạn.` });
    } else {
      showMessage({ type: 'error', text: "Có lỗi xảy ra khi gửi một số nhắc nhở." });
    }
    return allSuccess;
  };

  return {
    isSending,
    isDateDueOrOverdue,
    sendSingleReminder,
    sendReminders,
  };
};