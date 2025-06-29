import React, { useState } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Layout from '@/components/Layout';
import DayMonthInput from '@/components/DayMonthInput';
import ComboBox from '@/components/ComboBox';
import AssetReminderTable from '@/components/AssetReminderTable';
import SentAssetReminderTable from '@/components/SentAssetReminderTable';
import { useAssetReminderData } from '@/hooks/useAssetReminderData';
import { useAssetReminderOperations } from '@/hooks/useAssetReminderOperations';
import { useAssetReminderEmail } from '@/hooks/useAssetReminderEmail';
import { sendPushNotification } from '@/services/notificationService';
import { supabase } from '@/integrations/supabase/client'; // Added missing import

interface AssetReminder {
  id: string;
  ten_ts: string;
  ngay_den_han: string;
  cbkh: string | null;
  cbqln: string | null;
  is_sent: boolean;
  created_at: string;
}

const AssetReminders = () => {
  const [message, setMessage] = useState({ type: '', text: '' });

  const showMessage = (params: { type: 'success' | 'error' | 'info'; text: string }) => {
    setMessage(params);
  };

  const {
    reminders,
    sentReminders,
    staff,
    currentUser,
    isLoading,
    loadData
  } = useAssetReminderData();

  const {
    handleSubmit,
    handleDelete,
    handleDeleteSentReminder,
    handleDeleteAllSentReminders,
    exportToCSV
  } = useAssetReminderOperations(loadData, showMessage);

  const {
    isDateDueOrOverdue,
    sendSingleReminder,
    sendReminders
  } = useAssetReminderEmail(staff, loadData, showMessage);

  const createNotification = async (recipientUsername: string, title: string, message: string) => {
    if (!recipientUsername) return;
    await supabase.from('notifications').insert({
      recipient_username: recipientUsername,
      title,
      message,
      notification_type: 'asset_reminder',
    });
  };

  const handleSendSingleReminder = async (reminder: AssetReminder) => {
    const success = await sendSingleReminder(reminder);
    if (success) {
      const cbkhUser = staff.cbkh.find(s => s.ten_nv === reminder.cbkh);
      const cbqlnUser = staff.cbqln.find(s => s.ten_nv === reminder.cbqln);
      const message = `Tài sản "${reminder.ten_ts}" đã đến hạn.`;
      const payload = {
          title: 'Nhắc nhở tài sản đến hạn',
          body: message,
          url: '/asset-reminders'
      };
      if (cbkhUser) {
        createNotification(cbkhUser.email, 'Nhắc nhở tài sản', message);
        sendPushNotification(cbkhUser.email, payload);
      }
      if (cbqlnUser) {
        createNotification(cbqlnUser.email, 'Nhắc nhở tài sản', message);
        sendPushNotification(cbqlnUser.email, payload);
      }
    }
  };

  const handleSendAllReminders = async () => {
    const dueReminders = reminders.filter(r => isDateDueOrOverdue(r.ngay_den_han));
    const success = await sendReminders(dueReminders);
    if (success) {
      for (const reminder of dueReminders) {
        const cbkhUser = staff.cbkh.find(s => s.ten_nv === reminder.cbkh);
        const cbqlnUser = staff.cbqln.find(s => s.ten_nv === reminder.cbqln);
        const message = `Tài sản "${reminder.ten_ts}" đã đến hạn.`;
        const payload = {
            title: 'Nhắc nhở tài sản đến hạn',
            body: message,
            url: '/asset-reminders'
        };
        if (cbkhUser) {
            createNotification(cbkhUser.email, 'Nhắc nhở tài sản', message);
            sendPushNotification(cbkhUser.email, payload);
        }
        if (cbqlnUser) {
            createNotification(cbqlnUser.email, 'Nhắc nhở tài sản', message);
            sendPushNotification(cbqlnUser.email, payload);
        }
      }
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [sentSearchTerm, setSentSearchTerm] = useState('');
  const [editingReminder, setEditingReminder] = useState<AssetReminder | null>(null);
  
  const [tenTaiSan, setTenTaiSan] = useState('');
  const [ngayDenHan, setNgayDenHan] = useState('');
  const [selectedCBKH, setSelectedCBKH] = useState('');
  const [selectedCBQLN, setSelectedCBQLN] = useState('');

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    const success = await handleSubmit(
      tenTaiSan,
      ngayDenHan,
      selectedCBKH,
      selectedCBQLN,
      editingReminder
    );

    if (success) {
      setTenTaiSan('');
      setNgayDenHan('');
      setSelectedCBKH('');
      setSelectedCBQLN('');
      setEditingReminder(null);
    }
  };

  const handleEdit = (reminder: AssetReminder) => {
    setEditingReminder(reminder);
    setTenTaiSan(reminder.ten_ts);
    setNgayDenHan(reminder.ngay_den_han);
    setSelectedCBKH(reminder.cbkh || '');
    setSelectedCBQLN(reminder.cbqln || '');
  };

  const handleClear = () => {
    setEditingReminder(null);
    setTenTaiSan('');
    setNgayDenHan('');
    setSelectedCBKH('');
    setSelectedCBQLN('');
  };

  const filteredReminders = reminders.filter(reminder =>
    reminder.ten_ts.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (reminder.cbkh && reminder.cbkh.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (reminder.cbqln && reminder.cbqln.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredSentReminders = sentReminders.filter(reminder =>
    reminder.ten_ts.toLowerCase().includes(sentSearchTerm.toLowerCase()) ||
    (reminder.cbkh && reminder.cbkh.toLowerCase().includes(sentSearchTerm.toLowerCase())) ||
    (reminder.cbqln && reminder.cbqln.toLowerCase().includes(sentSearchTerm.toLowerCase()))
  );

  const cbkhOptions = staff.cbkh.map(member => member.ten_nv);
  const cbqlnOptions = staff.cbqln.map(member => member.ten_nv);

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <div className="flex items-center space-x-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nhắc tài sản đến hạn</h1>
            <p className="text-gray-600">Quản lý và gửi nhắc nhở về tài sản đến hạn trả</p>
          </div>
        </div>

        {message.text && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className={message.type === 'success' ? 'bg-green-100 border-green-400 text-green-800' : message.type === 'info' ? 'bg-blue-100 border-blue-400 text-blue-800' : ''}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tenTaiSan">Tên tài sản</Label>
                  <Input id="tenTaiSan" value={tenTaiSan} onChange={(e) => setTenTaiSan(e.target.value)} placeholder="Nhập tên TS" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="ngayDenHan">Ngày đến hạn</Label>
                  <DayMonthInput value={ngayDenHan} onChange={setNgayDenHan} placeholder="dd-MM" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="cbqln" className="text-blue-600 font-medium">CBQLN</Label>
                  <ComboBox value={selectedCBQLN} onChange={setSelectedCBQLN} options={cbqlnOptions} placeholder="Chọn nhân viên QLN" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="cbkh" className="text-red-600 font-medium">CBKH</Label>
                  <ComboBox value={selectedCBKH} onChange={setSelectedCBKH} options={cbkhOptions} placeholder="Chọn nhân viên KH" className="mt-1" />
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <Button type="button" variant="outline" onClick={handleClear}>Clear</Button>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={isLoading}>+ Thêm nhắc nhở</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Danh sách nhắc nhở ({filteredReminders.length})</CardTitle>
            <Button onClick={handleSendAllReminders} className="bg-green-600 hover:bg-green-700" disabled={isLoading}>Gửi email</Button>
          </CardHeader>
          <CardContent>
            <AssetReminderTable filteredReminders={filteredReminders} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} onSendSingle={handleSendSingleReminder} isDayMonthDueOrOverdue={isDateDueOrOverdue} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Danh sách đã gửi ({filteredSentReminders.length})</CardTitle>
            <Button onClick={handleDeleteAllSentReminders} variant="destructive" disabled={isLoading}>Xóa tất cả</Button>
          </CardHeader>
          <CardContent>
            <SentAssetReminderTable filteredSentReminders={filteredSentReminders} sentSearchTerm={sentSearchTerm} setSentSearchTerm={setSentSearchTerm} isLoading={isLoading} onDeleteSentReminder={handleDeleteSentReminder} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AssetReminders;