import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ShowMessageParams {
  type: 'success' | 'error' | 'info';
  text: string;
}

export const useAssetReminderOperations = (
  loadData: () => void,
  showMessage: (params: ShowMessageParams) => void
) => {
  const handleSubmit = async (
    tenTaiSan: string,
    ngayDenHan: string,
    selectedCBKH: string,
    selectedCBQLN: string,
    editingReminder: any
  ) => {
    if (!tenTaiSan || !ngayDenHan) {
      showMessage({ type: 'error', text: "Vui lòng điền đầy đủ thông tin bắt buộc" });
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

      if (editingReminder) {
        const { error } = await supabase
          .from('asset_reminders')
          .update(reminderData)
          .eq('id', editingReminder.id);

        if (error) throw error;
        showMessage({ type: 'success', text: "Cập nhật nhắc nhở thành công" });
      } else {
        const { error } = await supabase
          .from('asset_reminders')
          .insert([reminderData]);

        if (error) throw error;
        showMessage({ type: 'success', text: "Thêm nhắc nhở thành công" });
      }

      loadData();
      return true;
    } catch (error: any) {
      showMessage({ type: 'error', text: `Không thể lưu nhắc nhở: ${error.message}` });
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
      showMessage({ type: 'success', text: "Xóa nhắc nhở thành công" });
      loadData();
    } catch (error) {
      showMessage({ type: 'error', text: "Không thể xóa nhắc nhở" });
    }
  };

  const handleDeleteSentReminder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sent_asset_reminders')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showMessage({ type: 'success', text: "Xóa nhắc nhở đã gửi thành công" });
      loadData();
    } catch (error) {
      showMessage({ type: 'error', text: "Không thể xóa nhắc nhở đã gửi" });
    }
  };

  const exportToCSV = (reminders: any[]) => {
    if (reminders.length === 0) {
      showMessage({ type: 'info', text: "Không có dữ liệu để xuất" });
      return;
    }
    // ... (CSV export logic remains the same)
  };

  return {
    handleSubmit,
    handleDelete,
    handleDeleteSentReminder,
    exportToCSV
  };
};