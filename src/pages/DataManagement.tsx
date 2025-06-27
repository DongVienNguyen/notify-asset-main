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
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';
import JSZip from 'jszip';

type TableName = keyof Database['public']['Tables'];

interface EntityConfig {
  entity: TableName;
  name: string;
  fields: Array<{
    key: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'textarea';
    options?: string[];
    required?: boolean;
  }>;
}

const DataManagement = () => {
  const [selectedEntity, setSelectedEntity] = useState<string>('');
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

  const { user } = useSecureAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const ITEMS_PER_PAGE = 20;

  // Check admin access and set user context
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast({
        title: "Không có quyền truy cập",
        description: "Chỉ admin mới có thể truy cập module này",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    // Set user context for RLS policies
    const setUserContext = async () => {
      if (user && user.username) {
        try {
          console.log('Setting user context for admin:', user.username);
          await supabase.rpc('set_config', {
            setting_name: 'app.current_user',
            new_value: user.username,
            is_local: false
          });
          console.log('User context set successfully');
        } catch (error) {
          console.error('Error setting user context:', error);
          toast({
            title: "Cảnh báo",
            description: "Không thể thiết lập context người dùng",
            variant: "destructive",
          });
        }
      }
    };

    setUserContext();
  }, [user, navigate, toast]);

  // Comprehensive entity configuration for all database tables
  const entityConfig: Record<string, EntityConfig> = {
    AssetTransaction: {
      entity: 'asset_transactions',
      name: 'Giao dịch tài sản',
      fields: [
        { key: 'staff_code', label: 'Mã CB', type: 'text', required: true },
        { key: 'transaction_date', label: 'Ngày GD', type: 'date', required: true },
        { key: 'parts_day', label: 'Buổi', type: 'select', options: ['Sáng', 'Chiều'], required: true },
        { key: 'room', label: 'Phòng', type: 'text', required: true },
        { key: 'transaction_type', label: 'Loại GD', type: 'select', options: ['Mượn TS', 'Xuất kho'], required: true },
        { key: 'asset_year', label: 'Năm TS', type: 'number', required: true },
        { key: 'asset_code', label: 'Mã TS', type: 'number', required: true },
        { key: 'note', label: 'Ghi chú', type: 'textarea' }
      ]
    },
    Staff: {
      entity: 'staff',
      name: 'Nhân viên',
      fields: [
        { key: 'username', label: 'Tài khoản', type: 'text', required: true },
        { key: 'staff_name', label: 'Họ tên', type: 'text', required: true },
        { key: 'department', label: 'Phòng ban', type: 'text' },
        { key: 'role', label: 'Quyền', type: 'select', options: ['user', 'admin'], required: true },
        { key: 'account_status', label: 'Trạng thái', type: 'select', options: ['active', 'locked'] }
      ]
    },
    AssetReminders: {
      entity: 'asset_reminders',
      name: 'Nhắc nhở tài sản',
      fields: [
        { key: 'ten_ts', label: 'Tên tài sản', type: 'text', required: true },
        { key: 'ngay_den_han', label: 'Ngày đến hạn', type: 'text', required: true },
        { key: 'cbkh', label: 'Cán bộ KH', type: 'text' },
        { key: 'cbqln', label: 'Cán bộ QLN', type: 'text' },
        { key: 'is_sent', label: 'Đã gửi', type: 'select', options: ['true', 'false'] }
      ]
    },
    CRCReminders: {
      entity: 'crc_reminders',
      name: 'Nhắc nhở CRC',
      fields: [
        { key: 'loai_bt_crc', label: 'Loại báo cáo CRC', type: 'text', required: true },
        { key: 'ngay_thuc_hien', label: 'Ngày thực hiện', type: 'text', required: true },
        { key: 'ldpcrc', label: 'Lãnh đạo phê duyệt', type: 'text' },
        { key: 'cbcrc', label: 'Cán bộ CRC', type: 'text' },
        { key: 'quycrc', label: 'Thủ quỹ CRC', type: 'text' },
        { key: 'is_sent', label: 'Đã gửi', type: 'select', options: ['true', 'false'] }
      ]
    },
    Notifications: {
      entity: 'notifications',
      name: 'Thông báo',
      fields: [
        { key: 'title', label: 'Tiêu đề', type: 'text', required: true },
        { key: 'message', label: 'Nội dung', type: 'textarea', required: true },
        { key: 'notification_type', label: 'Loại thông báo', type: 'text', required: true },
        { key: 'recipient_username', label: 'Người nhận', type: 'text', required: true },
        { key: 'is_read', label: 'Đã đọc', type: 'select', options: ['true', 'false'] }
      ]
    },
    OtherAssets: {
      entity: 'other_assets',
      name: 'Tài sản khác',
      fields: [
        { key: 'name', label: 'Tên tài sản', type: 'text', required: true },
        { key: 'depositor', label: 'Người gửi', type: 'text' },
        { key: 'deposit_receiver', label: 'Người nhận gửi', type: 'text' },
        { key: 'deposit_date', label: 'Ngày gửi', type: 'date' },
        { key: 'withdrawal_deliverer', label: 'Người giao', type: 'text' },
        { key: 'withdrawal_receiver', label: 'Người nhận', type: 'text' },
        { key: 'withdrawal_date', label: 'Ngày lấy', type: 'date' },
        { key: 'notes', label: 'Ghi chú', type: 'textarea' }
      ]
    },
    CBQLN: {
      entity: 'cbqln',
      name: 'Cán bộ QLN',
      fields: [
        { key: 'ten_nv', label: 'Tên nhân viên', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'text', required: true }
      ]
    },
    CBKH: {
      entity: 'cbkh',
      name: 'Cán bộ KH',
      fields: [
        { key: 'ten_nv', label: 'Tên nhân viên', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'text', required: true }
      ]
    },
    LDPCRC: {
      entity: 'ldpcrc',
      name: 'Lãnh đạo phê duyệt CRC',
      fields: [
        { key: 'ten_nv', label: 'Tên nhân viên', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'text', required: true }
      ]
    },
    CBCRC: {
      entity: 'cbcrc',
      name: 'Cán bộ CRC',
      fields: [
        { key: 'ten_nv', label: 'Tên nhân viên', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'text', required: true }
      ]
    },
    QUYCRC: {
      entity: 'quycrc',
      name: 'Thủ quỹ CRC',
      fields: [
        { key: 'ten_nv', label: 'Tên nhân viên', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'text', required: true }
      ]
    }
  };

  // Load data when entity is selected
  useEffect(() => {
    if (selectedEntity && entityConfig[selectedEntity]) {
      loadData();
    }
  }, [selectedEntity]);

  // Load statistics
  useEffect(() => {
    loadStatistics();
  }, []);

  const loadData = async () => {
    if (!selectedEntity) return;

    setIsLoading(true);
    try {
      console.log('Loading data for entity:', selectedEntity);
      const config = entityConfig[selectedEntity];
      
      const { data: result, error } = await supabase
        .from(config.entity as any)
        .select('*')
        .order('id', { ascending: false });

      console.log('Data load result:', { result, error, count: result?.length });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      setData(result || []);
      console.log('Data loaded successfully:', result?.length, 'records');
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Lỗi",
        description: `Không thể tải dữ liệu: ${error.message || 'Lỗi không xác định'}`,
        variant: "destructive",
      });
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const [staffResult, transactionResult] = await Promise.all([
        supabase.from('staff').select('username, staff_name'),
        supabase.from('asset_transactions').select('staff_code')
      ]);

      const staff = staffResult.data || [];
      const transactions = transactionResult.data || [];

      const stats = staff.map(s => {
        const transactionCount = transactions.filter(t => t.staff_code === s.username).length;
        return {
          staff_name: s.staff_name,
          username: s.username,
          transaction_count: transactionCount,
          last_access: 'N/A' // Placeholder
        };
      }).sort((a, b) => b.transaction_count - a.transaction_count);

      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(item => 
      Object.values(item).some(value => 
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  // Paginate filtered data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({});
    setDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedEntity) return;

    try {
      const config = entityConfig[selectedEntity];
      const requiredFields = config.fields.filter(f => f.required);
      
      for (const field of requiredFields) {
        if (!formData[field.key]) {
          toast({
            title: "Lỗi",
            description: `Vui lòng điền ${field.label}`,
            variant: "destructive",
          });
          return;
        }
      }

      // Prepare form data for submission
      const submitData = { ...formData };
      
      // Convert boolean strings to actual booleans for boolean fields
      if (submitData.is_sent !== undefined) {
        submitData.is_sent = submitData.is_sent === 'true';
      }
      if (submitData.is_read !== undefined) {
        submitData.is_read = submitData.is_read === 'true';
      }

      if (editingItem) {
        const { error } = await supabase
          .from(config.entity as any)
          .update(submitData)
          .eq('id', editingItem.id);

        if (error) throw error;

        toast({
          title: "Thành công",
          description: "Cập nhật thành công",
        });
      } else {
        const { error } = await supabase
          .from(config.entity as any)
          .insert([submitData]);

        if (error) throw error;

        toast({
          title: "Thành công",
          description: "Thêm mới thành công",
        });
      }

      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu dữ liệu",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (item: any) => {
    if (!selectedEntity) return;

    try {
      const config = entityConfig[selectedEntity];
      const { error } = await supabase
        .from(config.entity as any)
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Xóa thành công",
      });

      loadData();
    } catch (error) {
      console.error('Error deleting:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa dữ liệu",
        variant: "destructive",
      });
    }
  };

  const toggleStaffLock = async (staff: any) => {
    try {
      const newStatus = staff.account_status === 'active' ? 'locked' : 'active';
      const { error } = await supabase
        .from('staff')
        .update({ 
          account_status: newStatus,
          failed_login_attempts: 0 
        })
        .eq('id', staff.id);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: `Đã ${newStatus === 'locked' ? 'khóa' : 'mở khóa'} tài khoản`,
      });

      loadData();
    } catch (error) {
      console.error('Error toggling staff lock:', error);
      toast({
        title: "Lỗi",
        description: "Không thể thay đổi trạng thái tài khoản",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    if (!selectedEntity) return;

    const config = entityConfig[selectedEntity];
    const headers = config.fields.map(f => f.label);
    const csvContent = [
      headers.join(','),
      ...filteredData.map(item => 
        config.fields.map(f => {
          const value = item[f.key] || '';
          // Escape commas and quotes in CSV
          return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${config.name}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const backupAllData = async () => {
    setIsBackingUp(true);
    try {
      const zip = new JSZip();
      const backupFolder = zip.folder("database-backup");
      
      for (const [key, config] of Object.entries(entityConfig)) {
        try {
          const { data: result } = await supabase
            .from(config.entity as any)
            .select('*');
          
          if (result && result.length > 0) {
            // Get all unique keys from the data
            const allKeys = new Set<string>();
            result.forEach(item => {
              Object.keys(item).forEach(key => allKeys.add(key));
            });
            const headers = Array.from(allKeys);
            
            const csvContent = [
              headers.join(','),
              ...result.map(item => 
                headers.map(header => {
                  const value = item[header] || '';
                  // Escape commas and quotes in CSV
                  return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
                    ? `"${value.replace(/"/g, '""')}"` 
                    : value;
                }).join(',')
              )
            ].join('\n');

            const BOM = '\uFEFF';
            backupFolder?.file(`${config.name}.csv`, BOM + csvContent);
          } else {
            // Create empty CSV file with headers if no data
            const headers = config.fields.map(f => f.label);
            backupFolder?.file(`${config.name}.csv`, '\uFEFF' + headers.join(',') + '\n');
          }
        } catch (error) {
          console.error(`Error backing up ${config.name}:`, error);
          // Continue with other tables even if one fails
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(zipBlob);
        link.setAttribute('href', url);
        link.setAttribute('download', `database-backup-${new Date().toISOString().split('T')[0]}.zip`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      toast({
        title: "Thành công",
        description: "Đã tải về backup toàn bộ dữ liệu dưới dạng file ZIP",
      });
    } catch (error) {
      console.error('Error backing up data:', error);
      toast({
        title: "Lỗi",
        description: "Không thể backup dữ liệu",
        variant: "destructive",
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const bulkDeleteTransactions = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn khoảng ngày",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('asset_transactions')
        .delete()
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã xóa giao dịch trong khoảng thời gian đã chọn",
      });

      if (selectedEntity === 'AssetTransaction') {
        loadData();
      }
    } catch (error) {
      console.error('Error bulk deleting:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa dữ liệu",
        variant: "destructive",
      });
    }
  };

  if (!user || user.role !== 'admin') {
    return <Layout><div>Đang kiểm tra quyền truy cập...</div></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
            <Settings className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý dữ liệu</h1>
            <p className="text-gray-600">Quản lý toàn bộ dữ liệu hệ thống - Chỉ dành cho Admin</p>
          </div>
        </div>

        <Tabs defaultValue="management" className="w-full">
          <TabsList>
            <TabsTrigger value="management">Quản lý dữ liệu</TabsTrigger>
            <TabsTrigger value="statistics">Thống kê</TabsTrigger>
          </TabsList>

          <TabsContent value="management" className="space-y-6">
            {/* Controls Card */}
            <Card>
              <CardHeader>
                <CardTitle>Chọn bảng dữ liệu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn bảng dữ liệu..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(entityConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-2">
                    {selectedEntity && (
                      <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm mới
                      </Button>
                    )}
                    <Button 
                      onClick={backupAllData} 
                      disabled={isBackingUp}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isBackingUp ? 'Đang backup...' : 'Backup All Data'}
                    </Button>
                  </div>
                </div>

                {selectedEntity && (
                  <div className="flex flex-col md:flex-row gap-4">
                    <Input
                      placeholder={`Tìm kiếm trong ${entityConfig[selectedEntity]?.name}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                    
                    <div className="flex gap-2">
                      <Button onClick={exportToCSV} className="bg-blue-600 hover:bg-blue-700">
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                      </Button>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Upload className="w-4 h-4 mr-2" />
                        Import CSV
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bulk Delete Card - Only for AssetTransaction */}
            {selectedEntity === 'AssetTransaction' && (
              <Card>
                <CardHeader>
                  <CardTitle>Xóa hàng loạt (Admin)</CardTitle>
                  <p className="text-sm text-gray-600">Cẩn thận! Hành động này không thể hoàn tác.</p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div>
                      <Label>Ngày bắt đầu</Label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Ngày kết thúc</Label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={bulkDeleteTransactions}
                      variant="destructive"
                    >
                      Xóa theo ngày
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Data Table */}
            {selectedEntity && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {entityConfig[selectedEntity]?.name} (Tổng: {filteredData.length} bản ghi)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
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
                          {paginatedData.map((item) => (
                            <TableRow key={item.id}>
                              {entityConfig[selectedEntity]?.fields.map((field) => (
                                <TableCell key={field.key}>
                                  {field.type === 'date' && item[field.key] 
                                    ? new Date(item[field.key]).toLocaleDateString('vi-VN')
                                    : item[field.key]
                                  }
                                </TableCell>
                              ))}
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive" 
                                    onClick={() => handleDelete(item)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                  {selectedEntity === 'Staff' && (
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => toggleStaffLock(item)}
                                    >
                                      {item.account_status === 'locked' ? (
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                      ) : (
                                        <Lock className="w-4 h-4" />
                                      )}
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                          <Button
                            variant="outline"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                          >
                            Trước
                          </Button>
                          
                          <span className="text-sm text-gray-600">
                            Trang {currentPage} trên {totalPages}
                          </span>
                          
                          <Button
                            variant="outline"
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                          >
                            Tiếp
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="statistics">
            <Card>
              <CardHeader>
                <CardTitle>Thống kê số lần lấy tài sản</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên nhân viên</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Tổng giao dịch</TableHead>
                      <TableHead>Lần truy cập cuối</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statistics.map((stat, index) => (
                      <TableRow key={index}>
                        <TableCell>{stat.staff_name}</TableCell>
                        <TableCell>{stat.username}</TableCell>
                        <TableCell>{stat.transaction_count}</TableCell>
                        <TableCell>{stat.last_access}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Chỉnh sửa' : 'Thêm mới'} {entityConfig[selectedEntity]?.name}
              </DialogTitle>
            </DialogHeader>
            
            {selectedEntity && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {entityConfig[selectedEntity].fields.map((field) => (
                  <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                    <Label htmlFor={field.key}>
                      {field.label} {field.required && '*'}
                    </Label>
                    
                    {field.type === 'select' ? (
                      <Select
                        value={formData[field.key] || ''}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, [field.key]: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Chọn ${field.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        id={field.key}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData[field.key] || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                      />
                    ) : (
                      <Input
                        id={field.key}
                        type={field.type}
                        value={formData[field.key] || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-end space-x-4 mt-6">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSave}>
                {editingItem ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default DataManagement;