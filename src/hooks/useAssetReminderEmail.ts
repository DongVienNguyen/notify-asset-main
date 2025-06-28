import { isDayMonthDueOrOverdue } from '@/utils/dateUtils';
import { sendSingleReminder as sendSingleReminderOperation } from './useAssetReminderEmail/singleReminderOperations';
import { sendReminders as sendRemindersOperation } from './useAssetReminderEmail/bulkReminderOperations';
import { toast } from 'sonner'; // Changed import from useToast to toast from sonner

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

export const useAssetReminderEmail = (
  staff: { cbkh: StaffMember[]; cbqln: StaffMember[] },
  loadData: () => Promise<void>
) => {
  // const { toast } = useToast(); // Removed this line

  const sendSingleReminder = async (reminder: AssetReminder) => {
    await sendSingleReminderOperation(reminder, staff, toast, loadData);
  };

  const sendReminders = async (reminders: AssetReminder[]) => {
    await sendRemindersOperation(reminders, staff, toast, loadData);
  };

  return {
    isDateDueOrOverdue: isDayMonthDueOrOverdue, // Use the centralized function
    sendSingleReminder,
    sendReminders
  };
};