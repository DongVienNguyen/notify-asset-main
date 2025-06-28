import { supabase } from '@/integrations/supabase/client';
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

export const useAssetReminderOperations = (loadData: () => Promise<void>) => {
  // const { toast } = useToast(); // Removed this line

  const handleSubmit = async (
    tenTaiSan: string,
    ngayDenHan: string,
    selectedCBKH: string,
    selectedCBQLN: string,
    editingReminder: AssetReminder | null
  ) => {
    if (!tenTaiSan || !ngayDenHan) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc"); // Changed toast usage
      return false;
    }

    try {
      const reminderData = {
        ten_ts: tenTaiSan,
        ngay_den_han: ngayDenHan,
        cbkh: selectedCBKH || null,
        cbqln: selectedCBQLN || null,
        is_sent: false
      };

      console.log('Submitting asset reminder data:', reminderData);

      if (editingReminder) {
        const { error } = await supabase
          .from('asset_reminders')
          .update(reminderData)
          .eq('id', editingReminder.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }

        toast.success("Cập nhật nhắc nhở tài sản thành công"); // Changed toast usage
      } else {
        const { error } = await supabase
          .from('asset_reminders')
          .insert([reminderData]);

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }

        toast.success("Thêm nhắc nhở tài sản thành công"); // Changed toast usage
      }

      loadData();
      return true;
    } catch (error: any) {
      console.error('Error saving asset reminder:', error);
      toast.error(`Không thể lưu nhắc nhở tài sản: ${error.message}`); // Changed toast usage
      return false;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('asset_reminders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Xóa nhắc nhở tài sản thành công"); // Changed toast usage

      loadData();
    } catch (error: any) {
      console.error('Error deleting asset reminder:', error);
      toast.error("Không thể xóa nhắc nhở tài sản"); // Changed toast usage
    }
  };

  const handleDeleteSentReminder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sent_asset_reminders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Xóa nhắc nhở tài sản đã gửi thành công"); // Changed toast usage

      loadData();
    } catch (error: any) {
      console.error('Error deleting sent asset reminder:', error);
      toast.error("Không thể xóa nhắc nhở tài sản đã gửi"); // Changed toast usage
    }
  };

  const exportToCSV = (filteredReminders: AssetReminder[]) => {
    const headers = ['Tên tài sản', 'Ngày đến hạn', 'CB KH', 'CB QLN', 'Đã gửi'];
    const csvContent = [
      headers.join(','),
      ...filteredReminders.map(reminder => [
        reminder.ten_ts,
        reminder.ngay_den_han,
        reminder.cbkh || '',
        reminder.cbqln || '',
        reminder.is_sent ? 'Có' : 'Không'
      ].join(','))
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `asset-reminders-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return {
    handleSubmit,
    handleDelete,
    handleDeleteSentReminder,
    exportToCSV
  };
};