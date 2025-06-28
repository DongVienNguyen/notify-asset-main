import React, { useState, useEffect, useMemo } from 'react';
import { Settings, Plus, Download, Upload, Trash2, Edit, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Layout from '@/components/Layout';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';
import JSZip from 'jszip';
import DateInput from '@/components/DateInput';

type TableName = keyof Database['public']['Tables'];

interface EntityConfig {
  entity: TableName;
  name: string;
  fields: Array<{
    key: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'boolean';
    options?: string[];
    required?: boolean;
  }>;
}

const DataManagement = () => {
  const entityConfig: Record<string, EntityConfig> = {
    staff: {
      entity: 'staff',
      name: 'Nhân viên',
      fields: [
        { key: 'username', label: 'Tên đăng nhập', type: 'text', required: true },
        { key: 'staff_name', label: 'Tên nhân viên', type: 'text' },
        { key: 'role', label: 'Vai trò', type: 'select', options: ['admin', 'user'], required: true },
        { key: 'department', label: 'Phòng ban', type: 'text' },
        { key: 'account_status', label: 'Trạng thái tài khoản', type: 'select', options: ['active', 'locked'], required: true },
        { key: 'created_at', label: 'Ngày tạo', type: 'date' },
        { key: 'updated_at', label: 'Ngày cập nhật', type: 'date' },
      ],
    },
    asset_transactions: {
      entity: 'asset_transactions',
      name: 'Giao dịch tài sản',
      fields: [
        { key: 'staff_code', label: 'Mã nhân viên', type: 'text', required: true },
        { key: 'transaction_date', label: 'Ngày giao dịch', type: 'date', required: true },
        { key: 'parts_day', label: 'Ca', type: 'text', required: true },
        { key: 'room', label: 'Phòng', type: 'text', required: true },
        { key: 'transaction_type', label: 'Loại giao dịch', type: 'text', required: true },
        { key: 'asset_year', label: 'Năm tài sản', type: 'number', required: true },
        { key: 'asset_code', label: 'Mã tài sản', type: 'number', required: true },
        { key: 'note', label: 'Ghi chú', type: 'textarea' },
        { key: 'created_at', label: 'Ngày tạo', type: 'date' },
      ],
    },
    notifications: {
      entity: 'notifications',
      name: 'Thông báo',
      fields: [
        { key: 'recipient_username', label: 'Người nhận', type: 'text', required: true },
        { key: 'title', label: 'Tiêu đề', type: 'text', required: true },
        { key: 'message', label: 'Nội dung', type: 'textarea', required: true },
        { key: 'notification_type', label: 'Loại thông báo', type: 'text', required: true },
        { key: 'is_read', label: 'Đã đọc', type: 'boolean', options: ['true', 'false'] },
        { key: 'created_at', label: 'Ngày tạo', type: 'date' },
      ],
    },
    asset_reminders: {
      entity: 'asset_reminders',
      name: 'Nhắc nhở tài sản',
      fields: [
        { key: 'ten_ts', label: 'Tên tài sản', type: 'text', required: true },
        { key: 'ngay_den_han', label: 'Ngày đến hạn', type: 'date', required: true },
        { key: 'cbqln', label: 'CB QLN', type: 'text' },
        { key: 'cbkh', label: 'CB KH', type: 'text' },
        { key: 'is_sent', label: 'Đã gửi', type: 'boolean', options: ['true', 'false'] },
        { key: 'created_at', label: 'Ngày tạo', type: 'date' },
      ],
    },
    crc_reminders: {
      entity: 'crc_reminders',
      name: 'Nhắc nhở CRC',
      fields: [
        { key: 'loai_bt_crc', label: 'Loại BT CRC', type: 'text', required: true },
        { key: 'ngay_thuc_hien', label: 'Ngày thực hiện', type: 'date', required: true },
        { key: 'ldpcrc', label: 'LDP CRC', type: 'text' },
        { key: 'cbcrc', label: 'CB CRC', type: 'text' },
        { key: 'quycrc', label: 'Quy CRC', type: 'text' },
        { key: 'is_sent', label: 'Đã gửi', type: 'boolean', options: ['true', 'false'] },
        { key: 'created_at', label: 'Ngày tạo', type: 'date' },
      ],
    },
    other_assets: {
      entity: 'other_assets',
      name: 'Tài sản khác',
      fields: [
        { key: 'name', label: 'Tên tài sản', type: 'text', required: true },
        { key: 'deposit_date', label: 'Ngày gửi', type: 'date' },
        { key: 'depositor', label: 'Người gửi', type: 'text' },
        { key: 'deposit_receiver', label: 'Người nhận gửi', type: 'text' },
        { key: 'withdrawal_date', label: 'Ngày rút', type: 'date' },
        { key: 'withdrawal_deliverer', label: 'Người giao rút', type: 'text' },
        { key: 'withdrawal_receiver', label: 'Người nhận rút', type: 'text' },
        { key: 'notes', label: 'Ghi chú', type: 'textarea' },
        { key: 'created_at', label: 'Ngày tạo', type: 'date' },
        { key: 'updated_at', label: 'Ngày cập nhật', type: 'date' },
      ],
    },
    cbqln: {
      entity: 'cbqln',
      name: 'CB QLN',
      fields: [
        { key: 'ten_nv', label: 'Tên nhân viên', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'text', required: true },
      ],
    },
    cbkh: {
      entity: 'cbkh',
      name: 'CB KH',
      fields: [
        { key: 'ten_nv', label: 'Tên nhân viên', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'text', required: true },
      ],
    },
    ldpcrc: {
      entity: 'ldpcrc',
      name: 'LDP CRC',
      fields: [
        { key: 'ten_nv', label: 'Tên nhân viên', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'text', required: true },
      ],
    },
    cbcrc: {
      entity: 'cbcrc',
      name: 'CB CRC',
      fields: [
        { key: 'ten_nv', label: 'Tên nhân viên', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'text', required: true },
      ],
    },
    quycrc: {
      entity: 'quycrc',
      name: 'Quy CRC',
      fields: [
        { key: 'ten_nv', label: 'Tên nhân viên', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'text', required: true },
      ],
    },
    sent_asset_reminders: {
      entity: 'sent_asset_reminders',
      name: 'Nhắc nhở tài sản đã gửi',
      fields: [
        { key: 'ten_ts', label: 'Tên tài sản', type: 'text', required: true },
        { key: 'ngay_den_han', label: 'Ngày đến hạn', type: 'date', required: true },
        { key: 'cbqln', label: 'CB QLN', type: 'text' },
        { key: 'cbkh', label: 'CB KH', type: 'text' },
        { key: 'is_sent', label: 'Đã gửi', type: 'boolean', options: ['true', 'false'] },
        { key: 'sent_date', label: 'Ngày gửi', type: 'date', required: true },
        { key: 'created_at', label: 'Ngày tạo', type: 'date' },
      ],
    },
    sent_crc_reminders: {
      entity: 'sent_crc_reminders',
      name: 'Nhắc nhở CRC đã gửi',
      fields: [
        { key: 'loai_bt_crc', label: 'Loại BT CRC', type: 'text', required: true },
        { key: 'ngay_thuc_hien', label: 'Ngày thực hiện', type: 'date', required: true },
        { key: 'ldpcrc', label: 'LDP CRC', type: 'text' },
        { key: 'cbcrc', label: 'CB CRC', type: 'text' },
        { key: 'quycrc', label: 'Quy CRC', type: 'text' },
        { key: 'is_sent', label: 'Đã gửi', type: 'boolean', options: ['true', 'false'] },
        { key: 'sent_date', label: 'Ngày gửi', type: 'date', required: true },
        { key: 'created_at', label: 'Ngày tạo', type: 'date' },
      ],
    },
    asset_history_archive: {
      entity: 'asset_history_archive',
      name: 'Lịch sử tài sản',
      fields: [
        { key: 'original_asset_id', label: 'ID tài sản gốc', type: 'text', required: true },
        { key: 'asset_name', label: 'Tên tài sản', type: 'text', required: true },
        { key: 'change_type', label: 'Loại thay đổi', type: 'text', required: true },
        { key: 'changed_by', label: 'Người thay đổi', type: 'text', required: true },
        { key: 'change_reason', label: 'Lý do thay đổi', type: 'textarea' },
        { key: 'created_at', label: 'Thời gian tạo', type: 'date' },
      ],
    },
  };

  const [selectedEntity, setSelectedEntity] = useState<string>('staff'); // Initialize with a default entity
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statistics, setStatistics] = useState<any[]>([]);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [restoreFile, setRestoreFile] = useState<File | null>(null);


  const { user } = useSecureAuth();
  const navigate = useNavigate();

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    if (user && user.role !== 'admin') {
      setMessage({ type: 'error', text: "Chỉ admin mới có thể truy cập module này" });
      navigate('/');
      return;
    }

    const setUserContext = async () => {
      if (user && user.username) {
        try {
          await supabase.rpc('set_config', { setting_name: 'app.current_user', new_value: user.username, is_local: false });
        } catch (error) {
          setMessage({ type: 'error', text: "Không thể thiết lập context người dùng" });
        }
      }
    };
    setUserContext();
  }, [user, navigate]);

  useEffect(() => { 
    if (selectedEntity && entityConfig[selectedEntity]) {
      loadData(); 
    }
  }, [selectedEntity]);

  useEffect(() => { loadStatistics(); }, []);

  const loadData = async () => {
    if (!selectedEntity) return;
    setIsLoading(true);
    try {
      const config = entityConfig[selectedEntity];
      const { data: result, error } = await supabase.from(config.entity as any).select('*').order('id', { ascending: false });
      if (error) throw error;
      setData(result || []);
    } catch (error: any) {
      setMessage({ type: 'error', text: `Không thể tải dữ liệu: ${error.message || 'Lỗi không xác định'}` });
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatistics = async () => {
    // Implement your statistics loading logic here
    // For example, count records in each table
    try {
      const stats = [];
      for (const key in entityConfig) {
        const { count, error } = await supabase
          .from(entityConfig[key].entity as any)
          .select('*', { count: 'exact', head: true });
        if (error) throw error;
        stats.push({ name: entityConfig[key].name, count: count });
      }
      setStatistics(stats);
    } catch (error: any) {
      console.error("Error loading statistics:", error.message);
      setMessage({ type: 'error', text: `Không thể tải thống kê: ${error.message}` });
    }
  };

  const filteredData = useMemo(() => data.filter(item => Object.values(item).some(value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase()))), [data, searchTerm]);
  const paginatedData = useMemo(() => { const startIndex = (currentPage - 1) * ITEMS_PER_PAGE; return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE); }, [filteredData, currentPage]);
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const handleAdd = () => { 
    setEditingItem(null); 
    const initialFormData: any = {};
    entityConfig[selectedEntity]?.fields.forEach(field => {
      if (field.type === 'boolean') {
        initialFormData[field.key] = 'false'; // Default for boolean select
      } else {
        initialFormData[field.key] = '';
      }
    });
    setFormData(initialFormData); 
    setDialogOpen(true); 
  };

  const handleEdit = (item: any) => { 
    setEditingItem(item); 
    const formattedItem: any = { ...item };
    entityConfig[selectedEntity]?.fields.forEach(field => {
      if (field.type === 'boolean' && formattedItem[field.key] !== undefined) {
        formattedItem[field.key] = formattedItem[field.key] ? 'true' : 'false';
      }
    });
    setFormData(formattedItem); 
    setDialogOpen(true); 
  };

  const handleSave = async () => {
    if (!selectedEntity) return;
    setMessage({ type: '', text: '' });
    try {
      const config = entityConfig[selectedEntity];
      for (const field of config.fields.filter(f => f.required)) {
        if (!formData[field.key]) {
          setMessage({ type: 'error', text: `Vui lòng điền ${field.label}` });
          return;
        }
      }
      const submitData = { ...formData };
      // Convert boolean strings to actual booleans
      config.fields.filter(f => f.type === 'boolean').forEach(field => {
        if (submitData[field.key] !== undefined) {
          submitData[field.key] = submitData[field.key] === 'true';
        }
      });

      if (editingItem) {
        const { error } = await supabase.from(config.entity as any).update(submitData).eq('id', editingItem.id);
        if (error) throw error;
        setMessage({ type: 'success', text: "Cập nhật thành công" });
      } else {
        const { error } = await supabase.from(config.entity as any).insert([submitData]);
        if (error) throw error;
        setMessage({ type: 'success', text: "Thêm mới thành công" });
      }
      setDialogOpen(false);
      loadData();
    } catch (error: any) {
      setMessage({ type: 'error', text: `Không thể lưu dữ liệu: ${error.message || 'Lỗi không xác định'}` });
    }
  };

  const handleDelete = async (item: any) => {
    if (!selectedEntity) return;
    setMessage({ type: '', text: '' });
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bản ghi này khỏi bảng ${entityConfig[selectedEntity].name}?`)) {
      return;
    }
    try {
      const config = entityConfig[selectedEntity];
      const { error } = await supabase.from(config.entity as any).delete().eq('id', item.id);
      if (error) throw error;
      setMessage({ type: 'success', text: "Xóa thành công" });
      loadData();
    } catch (error: any) {
      setMessage({ type: 'error', text: `Không thể xóa dữ liệu: ${error.message || 'Lỗi không xác định'}` });
    }
  };

  const toggleStaffLock = async (staff: any) => {
    setMessage({ type: '', text: '' });
    try {
      const newStatus = staff.account_status === 'active' ? 'locked' : 'active';
      const { error } = await supabase.from('staff').update({ account_status: newStatus, failed_login_attempts: 0, locked_at: newStatus === 'locked' ? new Date().toISOString() : null }).eq('id', staff.id);
      if (error) throw error;
      setMessage({ type: 'success', text: `Đã ${newStatus === 'locked' ? 'khóa' : 'mở khóa'} tài khoản` });
      loadData();
    } catch (error: any) {
      setMessage({ type: 'error', text: `Không thể thay đổi trạng thái tài khoản: ${error.message || 'Lỗi không xác định'}` });
    }
  };

  const exportToCSV = () => {
    if (filteredData.length === 0) {
      setMessage({ type: 'error', text: "Không có dữ liệu để xuất." });
      return;
    }
    const config = entityConfig[selectedEntity];
    const headers = config.fields.map(field => field.label).join(',');
    const rows = filteredData.map(item =>
      config.fields.map(field => {
        let value = item[field.key];
        if (field.type === 'date' && value) {
          value = new Date(value).toLocaleDateString('vi-VN');
        }
        return `"${value?.toString().replace(/"/g, '""') || ''}"`;
      }).join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${selectedEntity}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMessage({ type: 'success', text: "Xuất dữ liệu thành công." });
  };

  const backupAllData = async () => {
    setIsBackingUp(true);
    setMessage({ type: '', text: '' });
    try {
      const zip = new JSZip();
      for (const key in entityConfig) {
        const { data: tableData, error } = await supabase.from(entityConfig[key].entity as any).select('*');
        if (error) throw error;
        zip.file(`${key}.json`, JSON.stringify(tableData, null, 2));
      }
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.setAttribute('download', `supabase_backup_${new Date().toISOString().slice(0, 10)}.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setMessage({ type: 'success', text: "Sao lưu toàn bộ dữ liệu thành công." });
    } catch (error: any) {
      setMessage({ type: 'error', text: `Không thể sao lưu dữ liệu: ${error.message || 'Lỗi không xác định'}` });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreData = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setRestoreFile(event.target.files[0]);
      setMessage({ type: '', text: '' });
    }
  };

  const restoreAllData = async () => {
    if (!restoreFile) {
      setMessage({ type: 'error', text: "Vui lòng chọn tệp ZIP để khôi phục." });
      return;
    }
    setMessage({ type: '', text: '' });
    if (!window.confirm("Bạn có chắc chắn muốn khôi phục dữ liệu? Thao tác này sẽ GHI ĐÈ dữ liệu hiện có.")) {
      return;
    }

    try {
      const zip = await JSZip.loadAsync(restoreFile);
      for (const key in entityConfig) {
        const fileName = `${key}.json`;
        const file = zip.file(fileName);
        if (file) {
          const content = await file.async("text");
          const dataToRestore = JSON.parse(content);
          
          // Clear existing data
          const { error: deleteError } = await supabase.from(entityConfig[key].entity as any).delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
          if (deleteError) throw deleteError;

          // Insert new data in batches if necessary
          if (dataToRestore.length > 0) {
            const { error: insertError } = await supabase.from(entityConfig[key].entity as any).insert(dataToRestore);
            if (insertError) throw insertError;
          }
        }
      }
      setMessage({ type: 'success', text: "Khôi phục dữ liệu thành công." });
      loadData(); // Reload current selected entity data
      loadStatistics(); // Reload statistics
    } catch (error: any) {
      setMessage({ type: 'error', text: `Không thể khôi phục dữ liệu: ${error.message || 'Lỗi không xác định'}` });
    } finally {
      setRestoreFile(null);
    }
  };

  const bulkDeleteTransactions = async () => {
    setMessage({ type: '', text: '' });
    if (!startDate || !endDate) {
      setMessage({ type: 'error', text: "Vui lòng chọn cả ngày bắt đầu và ngày kết thúc." });
      return;
    }
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tất cả giao dịch từ ${startDate} đến ${endDate}? Thao tác này không thể hoàn tác.`)) {
      return;
    }
    try {
      const { error } = await supabase
        .from('asset_transactions')
        .delete()
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);

      if (error) throw error;
      setMessage({ type: 'success', text: `Đã xóa thành công các giao dịch từ ${startDate} đến ${endDate}.` });
      loadData(); // Reload data for asset_transactions if it's the selected entity
      loadStatistics();
    } catch (error: any) {
      setMessage({ type: 'error', text: `Không thể xóa giao dịch hàng loạt: ${error.message || 'Lỗi không xác định'}` });
    }
  };

  if (!user || user.role !== 'admin') return <Layout><div>Đang kiểm tra quyền truy cập...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <div className="flex items-center space-x-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full"><Settings className="w-6 h-6 text-gray-600" /></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý dữ liệu</h1>
            <p className="text-gray-600">Quản lý toàn bộ dữ liệu hệ thống - Chỉ dành cho Admin</p>
          </div>
        </div>

        {message.text && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className={message.type === 'success' ? 'bg-green-100 border-green-400 text-green-800' : ''}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="management" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 lg:grid-cols-9">
            <TabsTrigger value="management">Quản lý</TabsTrigger>
            <TabsTrigger value="backup-restore">Sao lưu/Khôi phục</TabsTrigger>
            <TabsTrigger value="bulk-delete">Xóa hàng loạt</TabsTrigger>
            {/* Add more tabs for other functionalities if needed */}
          </TabsList>

          <TabsContent value="management">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Chọn bảng dữ liệu
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Chọn bảng" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(entityConfig).map((key) => (
                        <SelectItem key={key} value={key}>
                          {entityConfig[key].name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" /> Thêm mới
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="ml-2">Đang tải dữ liệu...</span>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {entityConfig[selectedEntity]?.fields.map((field) => (
                            <TableHead key={field.key}>{field.label}</TableHead>
                          ))}
                          <TableHead>Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedData.length > 0 ? (
                          paginatedData.map((item) => (
                            <TableRow key={item.id}>
                              {entityConfig[selectedEntity]?.fields.map((field) => (
                                <TableCell key={field.key}>
                                  {field.type === 'date' && item[field.key]
                                    ? new Date(item[field.key]).toLocaleDateString('vi-VN')
                                    : field.type === 'boolean' && item[field.key] !== undefined
                                      ? (item[field.key] ? 'Có' : 'Không')
                                      : item[field.key]?.toString()}
                                </TableCell>
                              ))}
                              <TableCell>
                                <div className="flex space-x-2">
                                  {selectedEntity === 'staff' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => toggleStaffLock(item)}
                                      title={item.account_status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                    >
                                      <Lock className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="destructive" size="sm" onClick={() => handleDelete(item)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={(entityConfig[selectedEntity]?.fields.length || 0) + 1} className="text-center py-4">
                              Không có dữ liệu
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                    <div className="flex justify-between items-center mt-4">
                      <Button
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Trước
                      </Button>
                      <span>
                        Trang {currentPage} / {totalPages}
                      </span>
                      <Button
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Tiếp
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dialog for Add/Edit */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Chỉnh sửa' : 'Thêm mới'} {entityConfig[selectedEntity]?.name}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {entityConfig[selectedEntity]?.fields.map((field) => (
                  <div key={field.key} className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor={field.key} className="text-right">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </Label>
                    {field.type === 'select' || field.type === 'boolean' ? (
                      <Select
                        value={formData[field.key]?.toString() || ''}
                        onValueChange={(value) => setFormData({ ...formData, [field.key]: value })}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder={`Chọn ${field.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option === 'true' ? 'Có' : option === 'false' ? 'Không' : option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.type === 'date' ? (
                      <DateInput
                        value={formData[field.key] || ''}
                        onChange={(date) => setFormData({ ...formData, [field.key]: date })}
                        className="col-span-3"
                      />
                    ) : field.type === 'textarea' ? (
                      <textarea
                        id={field.key}
                        value={formData[field.key] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        className="col-span-3 border rounded-md p-2"
                      />
                    ) : (
                      <Input
                        id={field.key}
                        type={field.type}
                        value={formData[field.key] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        className="col-span-3"
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave}>Lưu</Button>
              </div>
            </DialogContent>
          </Dialog>

          <TabsContent value="backup-restore">
            <Card>
              <CardHeader>
                <CardTitle>Sao lưu & Khôi phục</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Sao lưu toàn bộ dữ liệu hệ thống vào một tệp ZIP.</p>
                <Button onClick={backupAllData} disabled={isBackingUp}>
                  <Download className="mr-2 h-4 w-4" /> {isBackingUp ? 'Đang sao lưu...' : 'Sao lưu toàn bộ dữ liệu'}
                </Button>
                <p>Khôi phục dữ liệu từ tệp ZIP đã sao lưu.</p>
                <Input type="file" accept=".zip" onChange={handleRestoreData} />
                <Button onClick={restoreAllData} disabled={!restoreFile}>
                  <Upload className="mr-2 h-4 w-4" /> Khôi phục dữ liệu
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk-delete">
            <Card>
              <CardHeader>
                <CardTitle>Xóa hàng loạt giao dịch tài sản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Xóa tất cả các giao dịch tài sản trong một khoảng thời gian cụ thể.</p>
                <div className="flex space-x-4">
                  <div>
                    <Label htmlFor="startDate">Ngày bắt đầu</Label>
                    <DateInput value={startDate} onChange={setStartDate} />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Ngày kết thúc</Label>
                    <DateInput value={endDate} onChange={setEndDate} />
                  </div>
                </div>
                <Button onClick={bulkDeleteTransactions} variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Xóa giao dịch
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default DataManagement;