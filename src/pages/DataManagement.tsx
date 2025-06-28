import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Settings, Plus, Download, Upload, Trash2, Edit, Lock, AlertCircle, BarChart2, Database as DatabaseIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
        { key: 'asset_year', label: 'Năm TS', type: 'number', required: true },
        { key: 'asset_code', label: 'Mã TS', type: 'number', required: true },
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

  const [selectedEntity, setSelectedEntity] = useState<string>('asset_transactions');
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
  const [message, setMessage] = useState({ type: '', text: '' });
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

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
      const { data: result, error } = await supabase.from(config.entity as any).select('*').order('created_at', { ascending: false });
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
    try {
      const stats = [];
      for (const key in entityConfig) {
        const { count, error } = await supabase
          .from(entityConfig[key].entity as any)
          .select('*', { count: 'exact', head: true });
        if (error) throw error;
        stats.push({ name: entityConfig[key].name, count: count || 0 });
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
        initialFormData[field.key] = 'false';
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
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${selectedEntity}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMessage({ type: 'success', text: "Xuất dữ liệu thành công." });
  };

  const handleRestoreData = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setRestoreFile(event.target.files[0]);
      setMessage({ type: 'info', text: `Đã chọn tệp: ${event.target.files[0].name}. Nhấn Import lần nữa để bắt đầu.` });
    }
  };

  const restoreAllData = async () => {
    if (!restoreFile) {
      setMessage({ type: 'error', text: "Vui lòng chọn tệp ZIP để import." });
      return;
    }
    setMessage({ type: '', text: '' });
    if (!window.confirm("Bạn có chắc chắn muốn import dữ liệu? Thao tác này sẽ GHI ĐÈ dữ liệu hiện có trong tất cả các bảng.")) {
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
          
          const { error: deleteError } = await supabase.from(entityConfig[key].entity as any).delete().neq('id', '00000000-0000-0000-0000-000000000000');
          if (deleteError) throw deleteError;

          if (dataToRestore.length > 0) {
            const { error: insertError } = await supabase.from(entityConfig[key].entity as any).insert(dataToRestore);
            if (insertError) throw insertError;
          }
        }
      }
      setMessage({ type: 'success', text: "Import dữ liệu thành công." });
      loadData();
      loadStatistics();
    } catch (error: any) {
      setMessage({ type: 'error', text: `Không thể import dữ liệu: ${error.message || 'Lỗi không xác định'}` });
    } finally {
      setRestoreFile(null);
      if(restoreInputRef.current) restoreInputRef.current.value = '';
    }
  };
  
  const handleImportClick = () => {
    if (restoreFile) {
      restoreAllData();
    } else {
      restoreInputRef.current?.click();
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
      loadData();
      loadStatistics();
    } catch (error: any) {
      setMessage({ type: 'error', text: `Không thể xóa giao dịch hàng loạt: ${error.message || 'Lỗi không xác định'}` });
    }
  };

  if (!user || user.role !== 'admin') return <Layout><div>Đang kiểm tra quyền truy cập...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center space-x-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
            <Settings className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý dữ liệu</h1>
            <p className="text-gray-500">Quản lý tất cả dữ liệu trong hệ thống với tốc độ cao</p>
          </div>
        </div>

        {message.text && (
          <Alert variant={message.type === 'error' ? 'destructive' : (message.type === 'info' ? 'default' : 'default')} className={message.type === 'success' ? 'bg-green-100 border-green-400 text-green-800' : ''}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="management" className="w-full">
          <TabsList className="border-b">
            <TabsTrigger value="management"><DatabaseIcon className="mr-2 h-4 w-4" />Quản lý dữ liệu</TabsTrigger>
            <TabsTrigger value="statistics"><BarChart2 className="mr-2 h-4 w-4" />Thống kê</TabsTrigger>
          </TabsList>

          <TabsContent value="management" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Chọn bảng dữ liệu</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-4">
                <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                  <SelectTrigger className="w-[220px]">
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
                <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="mr-2 h-4 w-4" /> New
                </Button>
                <Button variant="outline" onClick={exportToCSV}>
                  <Download className="mr-2 h-4 w-4" /> Export
                </Button>
                <Button variant="outline" onClick={handleImportClick}>
                  <Upload className="mr-2 h-4 w-4" /> Import
                </Button>
                <input
                  type="file"
                  ref={restoreInputRef}
                  onChange={handleRestoreData}
                  accept=".zip"
                  className="hidden"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tìm kiếm trong bảng dữ liệu</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder={`Tìm kiếm trong ${entityConfig[selectedEntity]?.name}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CardContent>
            </Card>

            {selectedEntity === 'asset_transactions' && (
              <Card className="bg-red-50 border-red-200">
                <CardHeader>
                  <CardTitle>Xóa hàng loạt (Admin)</CardTitle>
                  <p className="text-sm text-gray-600">Chọn khoảng thời gian để xóa tất cả các giao dịch trong khoảng đó. Hành động này không thể hoàn tác.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Ngày bắt đầu</Label>
                      <DateInput value={startDate} onChange={setStartDate} />
                    </div>
                    <div>
                      <Label htmlFor="endDate">Ngày kết thúc</Label>
                      <DateInput value={endDate} onChange={setEndDate} />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={bulkDeleteTransactions} variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Xóa theo ngày
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>{entityConfig[selectedEntity]?.name} (Tổng: {filteredData.length} bản ghi)</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="ml-2">Đang tải dữ liệu...</span>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {entityConfig[selectedEntity]?.fields.map((field) => (
                              <TableHead key={field.key}>{field.label}</TableHead>
                            ))}
                            <TableHead className="text-right">Thao tác</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedData.length > 0 ? (
                            paginatedData.map((item) => (
                              <TableRow key={item.id}>
                                {entityConfig[selectedEntity]?.fields.map((field) => (
                                  <TableCell key={field.key} className="py-2 px-4 whitespace-nowrap">
                                    {field.type === 'date' && item[field.key]
                                      ? new Date(item[field.key]).toLocaleDateString('vi-VN')
                                      : field.type === 'boolean' && item[field.key] !== undefined
                                        ? (item[field.key] ? 'Có' : 'Không')
                                        : item[field.key]?.toString()}
                                  </TableCell>
                                ))}
                                <TableCell className="text-right py-2 px-4">
                                  <div className="flex justify-end space-x-1">
                                    {selectedEntity === 'staff' && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => toggleStaffLock(item)}
                                        title={item.account_status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                      >
                                        <Lock className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} title="Chỉnh sửa">
                                      <Edit className="h-4 w-4 text-blue-600" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item)} title="Xóa">
                                      <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={(entityConfig[selectedEntity]?.fields.length || 0) + 1} className="text-center py-8">
                                Không có dữ liệu
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
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
                        disabled={currentPage === totalPages || totalPages === 0}
                      >
                        Tiếp
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Thống kê số lượng bản ghi</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {statistics.length > 0 ? (
                  statistics.map((stat) => (
                    <Card key={stat.name}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                        <DatabaseIcon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stat.count}</div>
                        <p className="text-xs text-muted-foreground">bản ghi</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p>Không có dữ liệu thống kê.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

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
        </Tabs>
      </div>
    </Layout>
  );
};

export default DataManagement;