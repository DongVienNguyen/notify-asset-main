import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner'; // Changed from '@/hooks/use-toast'
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { sendAssetNotificationEmail } from '@/services/emailService';
import { useCRCData } from '@/hooks/useCRCData';
import DayMonthInput from '@/components/DayMonthInput'; // Use DayMonthInput
import ComboBox from '@/components/ComboBox';
import CRCReminderTable from '@/components/CRCReminderTable';
import SentCRCReminderTable from '@/components/SentCRCReminderTable';
import { isDayMonthDueOrOverdue } from '@/utils/dateUtils'; // Use centralized util

const CRCReminders = () => {
  // const { toast } = useToast(); // Removed this line
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
  
  // Form state
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
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        console.log('👤 Current user loaded:', user);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  // Helper function to parse date and compare with current date is now removed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loaiCRC || !ngayThucHien) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc"); // Changed toast call
      return;
    }

    try {
      const extractName = (value: string) => {
        if (!value) return null;
        const match = value.match(/^(.+?)\s*\(/);
        return match ? match[1].trim() : value;
      };

      const reminderData = {
        loai_bt_crc: loaiCRC,
        ngay_thuc_hien: ngayThucHien,
        ldpcrc: extractName(selectedLDPCRC),
        cbcrc: extractName(selectedCBCRC),
        quycrc: extractName(selectedQuyLCRC),
        is_sent: false
      };

      console.log('📝 Submitting CRC reminder data:', reminderData);

      if (editingReminder) {
        const { error } = await supabase
          .from('crc_reminders')
          .update(reminderData)
          .eq('id', editingReminder.id);

        if (error) throw error;

        toast.success("Cập nhật nhắc nhở CRC thành công"); // Changed toast call
      } else {
        const { error } = await supabase
          .from('crc_reminders')
          .insert([reminderData]);

        if (error) throw error;

        toast.success("Thêm nhắc nhở CRC thành công"); // Changed toast call
      }

      // Reset form
      resetForm();
      refreshData();
    } catch (error) {
      console.error('Error saving CRC reminder:', error);
      toast.error(`Không thể lưu nhắc nhở CRC: ${error.message}`); // Changed toast call
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
    
    // Format values for ComboBox (find matching staff member)
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
    try {
      const { error } = await supabase
        .from('crc_reminders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Xóa nhắc nhở CRC thành công"); // Changed toast call

      refreshData();
    } catch (error) {
      console.error('Error deleting CRC reminder:', error);
      toast.error("Không thể xóa nhắc nhở CRC"); // Changed toast call
    }
  };

  const getEmailTemplate = (loaiCRC: string, ngayThucHien: string, ldpcrc: string, cbcrc: string, quycrc: string) => {
    // Filter out "Chưa chọn" values and create participant list
    const participants = [];
    if (ldpcrc && ldpcrc !== 'Chưa chọn') participants.push(`bạn ${ldpcrc}`);
    if (cbcrc && cbcrc !== 'Chưa chọn') participants.push(`bạn ${cbcrc}`);
    if (quycrc && quycrc !== 'Chưa chọn') participants.push(`bạn ${quycrc}`);
    
    const greeting = participants.length > 0 ? `Xin chào ${participants.join(', ')}, ` : 'Xin chào, ';
    
    return `${greeting}Có yêu cầu duyệt CRC loại ${loaiCRC} cần thực hiện vào ngày ${ngayThucHien}, các bạn hãy hoàn thành duyệt CRC trước 14 giờ 00 ngày ${ngayThucHien}. Trân trọng cám ơn.`;
  };

  const sendSingleReminder = async (reminder: any) => {
    try {
      if (!isDayMonthDueOrOverdue(reminder.ngay_thuc_hien)) {
        toast.info("Nhắc nhở CRC này chưa đến hạn"); // Changed toast call
        return;
      }

      const recipients = [];
      
      if (reminder.ldpcrc && reminder.ldpcrc !== 'Chưa chọn') {
        const ldpcrcMember = staff.ldpcrc.find(member => member.ten_nv === reminder.ldpcrc);
        if (ldpcrcMember && ldpcrcMember.email) {
          recipients.push(`${ldpcrcMember.email}.hvu@vietcombank.com.vn`);
        }
      }
      
      if (reminder.cbcrc && reminder.cbcrc !== 'Chưa chọn') {
        const cbcrcMember = staff.cbcrc.find(member => member.ten_nv === reminder.cbcrc);
        if (cbcrcMember && cbcrcMember.email) {
          recipients.push(`${cbcrcMember.email}.hvu@vietcombank.com.vn`);
        }
      }

      if (reminder.quycrc && reminder.quycrc !== 'Chưa chọn') {
        const quycrcMember = staff.quycrc.find(member => member.ten_nv === reminder.quycrc);
        if (quycrcMember && quycrcMember.email) {
          recipients.push(`${quycrcMember.email}.hvu@vietcombank.com.vn`);
        }
      }

      if (recipients.length === 0) {
        toast.error("Không tìm thấy người nhận email"); // Changed toast call
        return;
      }

      const subject = `Nhắc nhở duyệt CRC: ${reminder.loai_bt_crc}`;
      const content = getEmailTemplate(
        reminder.loai_bt_crc,
        reminder.ngay_thuc_hien,
        reminder.ldpcrc || 'Chưa chọn',
        reminder.cbcrc || 'Chưa chọn',
        reminder.quycrc || 'Chưa chọn'
      );

      console.log(`Sending CRC email for reminder ${reminder.id}:`, {
        recipients,
        subject,
        content
      });

      const emailResult = await sendAssetNotificationEmail(recipients, subject, content);
      
      if (emailResult.success) {
        const sentData = {
          loai_bt_crc: reminder.loai_bt_crc,
          ngay_thuc_hien: reminder.ngay_thuc_hien,
          ldpcrc: reminder.ldpcrc,
          cbcrc: reminder.cbcrc,
          quycrc: reminder.quycrc,
          is_sent: true,
          sent_date: new Date().toISOString().split('T')[0]
        };

        console.log('Moving sent CRC reminder to sent_crc_reminders:', sentData);

        const { error: insertError } = await supabase
          .from('sent_crc_reminders')
          .insert([sentData]);

        if (insertError) {
          console.error('Error inserting to sent_crc_reminders:', insertError);
          throw insertError;
        }

        const { error: deleteError } = await supabase
          .from('crc_reminders')
          .delete()
          .eq('id', reminder.id);

        if (deleteError) {
          console.error('Error deleting from crc_reminders:', deleteError);
          throw deleteError;
        }

        console.log(`Successfully moved CRC reminder ${reminder.id} to sent table`);

        toast.success("Đã gửi email nhắc nhở CRC và chuyển sang danh sách đã gửi"); // Changed toast call

        refreshData();
      } else {
        console.error(`Failed to send CRC email for reminder ${reminder.id}:`, emailResult.error);
        toast.error(`Không thể gửi email: ${emailResult.error}`); // Changed toast call
      }
    } catch (error) {
      console.error('Error sending single CRC reminder:', error);
      toast.error(`Không thể gửi email nhắc nhở CRC: ${error.message}`); // Changed toast call
    }
  };

  const sendReminders = async () => {
    try {
      const dueReminders = reminders.filter(reminder => isDayMonthDueOrOverdue(reminder.ngay_thuc_hien));
      
      if (dueReminders.length === 0) {
        toast.info("Không có nhắc nhở CRC nào đến hạn hoặc quá hạn"); // Changed toast call
        return;
      }

      let sentCount = 0;
      const sentRemindersData = [];

      for (const reminder of dueReminders) {
        const recipients = [];
        
        if (reminder.ldpcrc && reminder.ldpcrc !== 'Chưa chọn') {
          const ldpcrcMember = staff.ldpcrc.find(member => member.ten_nv === reminder.ldpcrc);
          if (ldpcrcMember && ldpcrcMember.email) {
            recipients.push(`${ldpcrcMember.email}.hvu@vietcombank.com.vn`);
          }
        }
        
        if (reminder.cbcrc && reminder.cbcrc !== 'Chưa chọn') {
          const cbcrcMember = staff.cbcrc.find(member => member.ten_nv === reminder.cbcrc);
          if (cbcrcMember && cbcrcMember.email) {
            recipients.push(`${cbcrcMember.email}.hvu@vietcombank.com.vn`);
          }
        }

        if (reminder.quycrc && reminder.quycrc !== 'Chưa chọn') {
          const quycrcMember = staff.quycrc.find(member => member.ten_nv === reminder.quycrc);
          if (quycrcMember && quycrcMember.email) {
            recipients.push(`${quycrcMember.email}.hvu@vietcombank.com.vn`);
          }
        }

        if (recipients.length > 0) {
          const subject = `Nhắc nhở duyệt CRC: ${reminder.loai_bt_crc}`;
          const content = getEmailTemplate(
            reminder.loai_bt_crc,
            reminder.ngay_thuc_hien,
            reminder.ldpcrc || 'Chưa chọn',
            reminder.cbcrc || 'Chưa chọn',
            reminder.quycrc || 'Chưa chọn'
          );

          const emailResult = await sendAssetNotificationEmail(recipients, subject, content);
          
          if (emailResult.success) {
            sentCount++;
            sentRemindersData.push(reminder);
          }
        }
      }

      if (sentRemindersData.length > 0) {
        const sentData = sentRemindersData.map(reminder => ({
          loai_bt_crc: reminder.loai_bt_crc,
          ngay_thuc_hien: reminder.ngay_thuc_hien,
          ldpcrc: reminder.ldpcrc,
          cbcrc: reminder.cbcrc,
          quycrc: reminder.quycrc,
          is_sent: true,
          sent_date: new Date().toISOString().split('T')[0]
        }));

        const { error: insertError } = await supabase
          .from('sent_crc_reminders')
          .insert(sentData);

        if (insertError) {
          throw insertError;
        }

        const sentIds = sentRemindersData.map(r => r.id);
        const { error: deleteError } = await supabase
          .from('crc_reminders')
          .delete()
          .in('id', sentIds);

        if (deleteError) {
          throw deleteError;
        }
      }

      toast.success(`Đã gửi ${sentCount} email nhắc nhở CRC và chuyển sang danh sách đã gửi`); // Changed toast call

      refreshData();
    } catch (error) {
      console.error('Error sending CRC reminders:', error);
      toast.error(`Không thể gửi email nhắc nhở CRC: ${error.message}`); // Changed toast call
    }
  };

  const handleDeleteSentReminder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sent_crc_reminders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Xóa nhắc nhở CRC đã gửi thành công"); // Changed toast call

      refreshData();
    } catch (error) {
      console.error('Error deleting sent CRC reminder:', error);
      toast.error("Không thể xóa nhắc nhở CRC đã gửi"); // Changed toast call
    }
  };

  const exportToCSV = () => {
    const headers = ['Loại báo tài CRC', 'Ngày thực hiện', 'LDP CRC', 'CB CRC', 'Quy CRC', 'Đã gửi'];
    const csvContent = [
      headers.join(','),
      ...filteredReminders.map(reminder => [
        reminder.loai_bt_crc,
        reminder.ngay_thuc_hien,
        reminder.ldpcrc || '',
        reminder.cbcrc || '',
        reminder.quycrc || '',
        reminder.is_sent ? 'Có' : 'Không'
      ].join(','))
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `crc-reminders-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const filteredReminders = reminders.filter(reminder =>
    reminder.loai_bt_crc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (reminder.ldpcrc && reminder.ldpcrc.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (reminder.cbcrc && reminder.cbcrc.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (reminder.quycrc && reminder.quycrc.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredSentReminders = sentReminders.filter(reminder =>
    reminder.loai_bt_crc.toLowerCase().includes(sentSearchTerm.toLowerCase()) ||
    (reminder.ldpcrc && reminder.ldpcrc.toLowerCase().includes(sentSearchTerm.toLowerCase())) ||
    (reminder.cbcrc && reminder.cbcrc.toLowerCase().includes(sentSearchTerm.toLowerCase())) ||
    (reminder.quycrc && reminder.quycrc.toLowerCase().includes(sentSearchTerm.toLowerCase()))
  );

  // Tạo options cho ComboBox từ dữ liệu staff
  const ldpcrcOptions = staff.ldpcrc.map(member => `${member.ten_nv} (${member.email})`);
  const cbcrcOptions = staff.cbcrc.map(member => `${member.ten_nv} (${member.email})`);
  const quycrcOptions = staff.quycrc.map(member => `${member.ten_nv} (${member.email})`);

  const totalStaff = staff.ldpcrc.length + staff.cbcrc.length + staff.quycrc.length;

  console.log('🎨 Rendering CRC page with data:', { 
    totalStaff,
    remindersCount: filteredReminders.length,
    sentRemindersCount: filteredSentReminders.length,
    isLoading,
    error
  });

  return (
    <Layout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nhắc duyệt CRC</h1>
            <p className="text-gray-600">Quản lý và gửi nhắc nhở về việc duyệt CRC đến hạn</p>
          </div>
        </div>

        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle>Thêm nhắc nhở CRC</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="loaiCRC">Loại BT CRC</Label>
                  <Input
                    id="loaiCRC"
                    value={loaiCRC}
                    onChange={(e) => setLoaiCRC(e.target.value)}
                    placeholder="Nhập/xuất/mượn - Số - Tên TS"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="ngayThucHien">Ngày thực hiện</Label>
                  <DayMonthInput
                    value={ngayThucHien}
                    onChange={setNgayThucHien}
                    placeholder="26-06"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cbcrc">CBCRC</Label>
                  <ComboBox
                    value={selectedCBCRC}
                    onChange={setSelectedCBCRC}
                    options={cbcrcOptions}
                    placeholder="Nhập tên CB làm CRC"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="ldpcrc">LDPCRC</Label>
                  <ComboBox
                    value={selectedLDPCRC}
                    onChange={setSelectedLDPCRC}
                    options={ldpcrcOptions}
                    placeholder="Nhập tên LDP duyệt CRC"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="quycrc">QUYÇRC</Label>
                  <ComboBox
                    value={selectedQuyLCRC}
                    onChange={setSelectedQuyLCRC}
                    options={quycrcOptions}
                    placeholder="Nhập tên Thủ quỹ duyệt CRC"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Clear
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  + Thêm nhắc nhở
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Reminders Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Danh sách chờ gửi ({filteredReminders.length})
            </CardTitle>
            <Button 
              onClick={sendReminders} 
              className="bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              Gửi tất cả
            </Button>
          </CardHeader>
          <CardContent>
            <CRCReminderTable
              filteredReminders={filteredReminders}
              isLoading={isLoading}
              isDayMonthDueOrOverdue={isDayMonthDueOrOverdue}
              onSendSingleReminder={sendSingleReminder}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>

        {/* Sent Reminders Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Danh sách đã gửi ({filteredSentReminders.length})
            </CardTitle>
            <Button 
              onClick={() => exportToCSV()}
              variant="destructive"
              disabled={isLoading}
            >
              Xóa tất cả
            </Button>
          </CardHeader>
          <CardContent>
            <SentCRCReminderTable
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

export default CRCReminders;