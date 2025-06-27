
import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Layout from '@/components/Layout';
import DateInput from '@/components/DateInput';
import ComboBox from '@/components/ComboBox';
import AssetReminderTable from '@/components/AssetReminderTable';
import SentAssetReminderTable from '@/components/SentAssetReminderTable';
import { useAssetReminderData } from '@/hooks/useAssetReminderData';
import { useAssetReminderOperations } from '@/hooks/useAssetReminderOperations';
import { useAssetReminderEmail } from '@/hooks/useAssetReminderEmail';

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

const AssetReminders = () => {
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
    exportToCSV
  } = useAssetReminderOperations(loadData);

  const {
    isDateDueOrOverdue,
    sendSingleReminder,
    sendReminders
  } = useAssetReminderEmail(staff, loadData);

  const [searchTerm, setSearchTerm] = useState('');
  const [sentSearchTerm, setSentSearchTerm] = useState('');
  const [editingReminder, setEditingReminder] = useState<AssetReminder | null>(null);
  
  // Form state
  const [tenTaiSan, setTenTaiSan] = useState('');
  const [ngayDenHan, setNgayDenHan] = useState('');
  const [selectedCBKH, setSelectedCBKH] = useState('');
  const [selectedCBQLN, setSelectedCBQLN] = useState('');

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await handleSubmit(
      tenTaiSan,
      ngayDenHan,
      selectedCBKH,
      selectedCBQLN,
      editingReminder
    );

    if (success) {
      // Reset form
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

  console.log('Rendering Asset Reminders with staff data:', { 
    cbkhCount: cbkhOptions.length, 
    cbqlnCount: cbqlnOptions.length,
    remindersCount: filteredReminders.length,
    staffState: staff
  });

  return (
    <Layout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nhắc tài sản đến hạn</h1>
            <p className="text-gray-600">Quản lý và gửi nhắc nhở về tài sản đến hạn trả</p>
          </div>
        </div>

        {/* Form Section */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tenTaiSan">Tên tài sản</Label>
                  <Input
                    id="tenTaiSan"
                    value={tenTaiSan}
                    onChange={(e) => setTenTaiSan(e.target.value)}
                    placeholder="Nhập tên TS"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="ngayDenHan">Ngày đến hạn</Label>
                  <DateInput
                    value={ngayDenHan}
                    onChange={setNgayDenHan}
                    placeholder="dd-MM"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cbqln" className="text-blue-600 font-medium">CBQLN</Label>
                  <ComboBox
                    value={selectedCBQLN}
                    onChange={setSelectedCBQLN}
                    options={cbqlnOptions}
                    placeholder="Chọn nhân viên QLN"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cbkh" className="text-red-600 font-medium">CBKH</Label>
                  <ComboBox
                    value={selectedCBKH}
                    onChange={setSelectedCBKH}
                    options={cbkhOptions}
                    placeholder="Chọn nhân viên KH"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button type="button" variant="outline" onClick={handleClear}>
                  Clear
                </Button>
                <Button 
                  type="submit" 
                  className="bg-orange-600 hover:bg-orange-700"
                  disabled={isLoading}
                >
                  + Thêm nhắc nhở
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Reminders Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Danh sách nhắc nhở ({filteredReminders.length})
            </CardTitle>
            <Button 
              onClick={() => sendReminders(reminders)} 
              className="bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              Gửi email
            </Button>
          </CardHeader>
          <CardContent>
            <AssetReminderTable
              filteredReminders={filteredReminders}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSendSingle={sendSingleReminder}
              isDateDueOrOverdue={isDateDueOrOverdue}
            />
          </CardContent>
        </Card>

        {/* Sent Reminders Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Danh sách đã gửi ({filteredSentReminders.length})
            </CardTitle>
            <Button 
              onClick={() => exportToCSV(filteredReminders)}
              variant="destructive"
              disabled={isLoading}
            >
              Xóa tất cả
            </Button>
          </CardHeader>
          <CardContent>
            <SentAssetReminderTable
              filteredSentReminders={filteredSentReminders}
              sentSearchTerm={sentSearchTerm}
              setSentSearchTerm={setSentSearchTerm}
              isLoading={isLoading}
              onDeleteSentReminder={handleDeleteSentReminder}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AssetReminders;
