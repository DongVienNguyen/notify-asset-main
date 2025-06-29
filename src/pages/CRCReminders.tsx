import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { sendAssetNotificationEmail } from '@/services/emailService';
import { useCRCData } from '@/hooks/useCRCData';
import DayMonthInput from '@/components/DayMonthInput';
import ComboBox from '@/components/ComboBox';
import CRCReminderTable from '@/components/CRCReminderTable';
import SentCRCReminderTable from '@/components/SentCRCReminderTable';
import { isDayMonthDueOrOverdue } from '@/utils/dateUtils';
import { sendPushNotification } from '@/services/notificationService';

const CRCReminders = () => {
  const {
    staff,
    reminders,
    sentReminders,
    isLoading,
    error,
    loadAllData,
    refreshData
  } = useCRCData();

  const [currentUser, setCurrentUser] = useState<{ role: string; username: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sentSearchTerm, setSentSearchTerm] = useState('');
  const [editingReminder, setEditingReminder] = useState<any>(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [loaiCRC, setLoaiCRC] = useState('');
  const [ngayThucHien, setNgayThucHien] = useState('');
  const [selectedLDPCRC, setSelectedLDPCRC] = useState('');
  const [selectedCBCRC, setSelectedCBCRC] = useState('');
  const [selectedQuyLCRC, setSelectedQuyLCRC] = useState('');

  useEffect(() => {
    loadCurrentUser();
    loadAllData();
  }, [loadAllData]);

  const loadCurrentUser = async () => {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) setCurrentUser(JSON.parse(userStr));
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    if (!loaiCRC || !ngayThucHien) {
      setMessage({ type: 'error', text: "Vui lòng điền đầy đủ thông tin bắt buộc" });
      return;
    }

    try {
      const extractName = (value: string) => value ? (value.match(/^(.+?)\s*\(/) || [null, value])[1]?.trim() : null;

      const reminderData = {
        loai_bt_crc: loaiCRC,
        ngay_thuc_hien: ngayThucHien,
        ldpcrc: extractName(selectedLDPCRC),
        cbcrc: extractName(selectedCBCRC),
        quycrc: extractName(selectedQuyLCRC),
        is_sent: false
      };

      if (editingReminder) {
        const { error } = await supabase.from('crc_reminders').update(reminderData).eq('id', editingReminder.id);
        if (error) throw error;
        setMessage({ type: 'success', text: "Cập nhật nhắc nhở CRC thành công" });
      } else {
        const { error } = await supabase.from('crc_reminders').insert([reminderData]);
        if (error) throw error;
        setMessage({ type: 'success', text: "Thêm nhắc nhở CRC thành công" });
      }

      resetForm();
      refreshData();
    } catch (error: any) {
      setMessage({ type: 'error', text: `Không thể lưu nhắc nhở CRC: ${error.message}` });
    }
  };

  const resetForm = () => {
    setLoaiCRC('');
    setNgayThucHien('');
    setSelectedLDPCRC('');
    setSelectedCBCRC('');
    setSelectedQuyLCRC('');
    setEditingReminder(null);
  };

  const handleEdit = (reminder: any) => {
    setEditingReminder(reminder);
    setLoaiCRC(reminder.loai_bt_crc);
    setNgayThucHien(reminder.ngay_thuc_hien);
    
    const formatStaffValue = (name: string, staffList: any[]) => {
      if (!name) return '';
      const staffMember = staffList.find(s => s.ten_nv === name);
      return staffMember ? `${staffMember.ten_nv} (${staffMember.email})` : name;
    };

    setSelectedLDPCRC(formatStaffValue(reminder.ldpcrc || '', staff.ldpcrc));
    setSelectedCBCRC(formatStaffValue(reminder.cbcrc || '', staff.cbcrc));
    setSelectedQuyLCRC(formatStaffValue(reminder.quycrc || '', staff.quycrc));
  };

  const handleDelete = async (id: string) => {
    setMessage({ type: '', text: '' });
    try {
      const { error } = await supabase.from('crc_reminders').delete().eq('id', id);
      if (error) throw error;
      setMessage({ type: 'success', text: "Xóa nhắc nhở CRC thành công" });
      refreshData();
    } catch (error) {
      setMessage({ type: 'error', text: "Không thể xóa nhắc nhở CRC" });
    }
  };

  const getEmailTemplate = (loaiCRC: string, ngayThucHien: string, ldpcrc: string, cbcrc: string, quycrc: string) => {
    const participants = [ldpcrc, cbcrc, quycrc].filter(p => p && p !== 'Chưa chọn').map(p => `bạn ${p}`);
    const greeting = participants.length > 0 ? `Xin chào ${participants.join(', ')}, ` : 'Xin chào, ';
    return `${greeting}Có yêu cầu duyệt CRC loại ${loaiCRC} cần thực hiện vào ngày ${ngayThucHien}, các bạn hãy hoàn thành duyệt CRC trước 14 giờ 00 ngày ${ngayThucHien}. Trân trọng cám ơn.`;
  };

  const createNotification = async (recipientUsername: string, title: string, message: string) => {
    if (!recipientUsername) return;
    await supabase.from('notifications').insert({
      recipient_username: recipientUsername,
      title,
      message,
      notification_type: 'crc_reminder',
    });
  };

  const sendSingleReminder = async (reminder: any) => {
    setMessage({ type: '', text: '' });
    try {
      if (!isDayMonthDueOrOverdue(reminder.ngay_thuc_hien)) {
        setMessage({ type: 'info', text: "Nhắc nhở CRC này chưa đến hạn" });
        return;
      }

      const getRecipient = (name: string, staffList: any[]) => {
        if (!name || name === 'Chưa chọn') return null;
        return staffList.find(m => m.ten_nv === name) || null;
      };

      const recipientsInfo = [
        getRecipient(reminder.ldpcrc, staff.ldpcrc),
        getRecipient(reminder.cbcrc, staff.cbcrc),
        getRecipient(reminder.quycrc, staff.quycrc)
      ].filter(Boolean);

      const recipientEmails = recipientsInfo.map(r => `${r.email}.hvu@vietcombank.com.vn`);

      if (recipientEmails.length === 0) {
        setMessage({ type: 'error', text: "Không tìm thấy người nhận email" });
        return;
      }

      const subject = `Nhắc nhở duyệt CRC: ${reminder.loai_bt_crc}`;
      const content = getEmailTemplate(reminder.loai_bt_crc, reminder.ngay_thuc_hien, reminder.ldpcrc || 'Chưa chọn', reminder.cbcrc || 'Chưa chọn', reminder.quycrc || 'Chưa chọn');
      const emailResult = await sendAssetNotificationEmail(recipientEmails, subject, content);
      
      if (emailResult.success) {
        const sentData = { ...reminder, is_sent: true, sent_date: new Date().toISOString().split('T')[0] };
        delete sentData.id;
        await supabase.from('sent_crc_reminders').insert([sentData]);
        await supabase.from('crc_reminders').delete().eq('id', reminder.id);
        
        const notifMessage = `Yêu cầu duyệt CRC loại "${reminder.loai_bt_crc}" cần thực hiện vào ngày ${reminder.ngay_thuc_hien}.`;
        const pushPayload = {
            title: 'Nhắc nhở duyệt CRC',
            body: notifMessage,
            url: '/crc-reminders'
        };
        for (const recipient of recipientsInfo) {
          createNotification(recipient.email, 'Nhắc nhở duyệt CRC', notifMessage);
          sendPushNotification(recipient.email, pushPayload);
        }

        setMessage({ type: 'success', text: "Đã gửi email và chuyển sang danh sách đã gửi" });
        refreshData();
      } else {
        throw new Error(emailResult.error);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: `Không thể gửi email: ${error.message}` });
    }
  };

  const sendReminders = async () => {
    setMessage({ type: '', text: '' });
    const dueReminders = reminders.filter(r => isDayMonthDueOrOverdue(r.ngay_thuc_hien));
    if (dueReminders.length === 0) {
      setMessage({ type: 'info', text: "Không có nhắc nhở CRC nào đến hạn hoặc quá hạn" });
      return;
    }
    for (const reminder of dueReminders) {
      await sendSingleReminder(reminder);
    }
  };

  const handleDeleteSentReminder = async (id: string) => {
    setMessage({ type: '', text: '' });
    try {
      const { error } = await supabase.from('sent_crc_reminders').delete().eq('id', id);
      if (error) throw error;
      setMessage({ type: 'success', text: "Xóa nhắc nhở đã gửi thành công" });
      refreshData();
    } catch (error: any) {
      setMessage({ type: 'error', text: `Không thể xóa nhắc nhở đã gửi: ${error.message}` });
    }
  };

  const handleDeleteAllSentCRCReminders = async () => {
    setMessage({ type: '', text: '' });
    try {
      const { error } = await supabase.from('sent_crc_reminders').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all by matching a non-existent ID
      if (error) throw error;
      setMessage({ type: 'success', text: "Đã xóa tất cả nhắc nhở CRC đã gửi thành công." });
      refreshData();
    } catch (error: any) {
      setMessage({ type: 'error', text: `Không thể xóa tất cả nhắc nhở CRC đã gửi: ${error.message}` });
    }
  };

  const exportToCSV = () => { /* ... existing logic ... */ };

  const filteredReminders = reminders.filter(r => [r.loai_bt_crc, r.ldpcrc, r.cbcrc, r.quycrc].some(val => val?.toLowerCase().includes(searchTerm.toLowerCase())));
  const filteredSentReminders = sentReminders.filter(r => [r.loai_bt_crc, r.ldpcrc, r.cbcrc, r.quycrc].some(val => val?.toLowerCase().includes(sentSearchTerm.toLowerCase())));
  const ldpcrcOptions = staff.ldpcrc.map(m => `${m.ten_nv} (${m.email})`);
  const cbcrcOptions = staff.cbcrc.map(m => `${m.ten_nv} (${m.email})`);
  const quycrcOptions = staff.quycrc.map(m => `${m.ten_nv} (${m.email})`);

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <div className="flex items-center space-x-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full"><Clock className="w-6 h-6 text-blue-600" /></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nhắc duyệt CRC</h1>
            <p className="text-gray-600">Quản lý và gửi nhắc nhở về việc duyệt CRC đến hạn</p>
          </div>
        </div>

        {message.text && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className={message.type === 'success' ? 'bg-green-100 border-green-400 text-green-800' : message.type === 'info' ? 'bg-blue-100 border-blue-400 text-blue-800' : ''}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader><CardTitle>Thêm nhắc nhở CRC</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="loaiCRC">Loại BT CRC</Label><Input id="loaiCRC" value={loaiCRC} onChange={(e) => setLoaiCRC(e.target.value)} placeholder="Nhập/xuất/mượn - Số - Tên TS" className="mt-1" /></div>
                <div><Label htmlFor="ngayThucHien">Ngày thực hiện</Label><DayMonthInput value={ngayThucHien} onChange={setNgayThucHien} placeholder="26-06" className="mt-1" /></div>
                <div><Label htmlFor="cbcrc">CBCRC</Label><ComboBox value={selectedCBCRC} onChange={setSelectedCBCRC} options={cbcrcOptions} placeholder="Nhập tên CB làm CRC" className="mt-1" /></div>
                <div><Label htmlFor="ldpcrc">LDPCRC</Label><ComboBox value={selectedLDPCRC} onChange={setSelectedLDPCRC} options={ldpcrcOptions} placeholder="Nhập tên LDP duyệt CRC" className="mt-1" /></div>
                <div><Label htmlFor="quycrc">QUYÇRC</Label><ComboBox value={selectedQuyLCRC} onChange={setSelectedQuyLCRC} options={quycrcOptions} placeholder="Nhập tên Thủ quỹ duyệt CRC" className="mt-1" /></div>
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>Clear</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>+ Thêm nhắc nhở</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Danh sách chờ gửi ({filteredReminders.length})</CardTitle>
            <Button onClick={sendReminders} className="bg-green-600 hover:bg-green-700" disabled={isLoading}>Gửi tất cả</Button>
          </CardHeader>
          <CardContent>
            <CRCReminderTable filteredReminders={filteredReminders} isLoading={isLoading} isDayMonthDueOrOverdue={isDayMonthDueOrOverdue} onSendSingleReminder={sendSingleReminder} onEdit={handleEdit} onDelete={handleDelete} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Danh sách đã gửi ({filteredSentReminders.length})</CardTitle>
            <Button onClick={handleDeleteAllSentCRCReminders} variant="destructive" disabled={isLoading}>Xóa tất cả</Button>
          </CardHeader>
          <CardContent>
            <SentCRCReminderTable filteredSentReminders={filteredSentReminders} sentSearchTerm={sentSearchTerm} setSentSearchTerm={setSentSearchTerm} isLoading={isLoading} onDeleteSentReminder={handleDeleteSentReminder} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CRCReminders;