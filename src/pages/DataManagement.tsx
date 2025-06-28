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
  const [message, setMessage] = useState({ type: '', text: '' });

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

  const entityConfig: Record<string, EntityConfig> = { /* ... existing config ... */ };

  useEffect(() => { if (selectedEntity && entityConfig[selectedEntity]) loadData(); }, [selectedEntity]);
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

  const loadStatistics = async () => { /* ... existing logic ... */ };

  const filteredData = useMemo(() => data.filter(item => Object.values(item).some(value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase()))), [data, searchTerm]);
  const paginatedData = useMemo(() => { const startIndex = (currentPage - 1) * ITEMS_PER_PAGE; return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE); }, [filteredData, currentPage]);
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const handleAdd = () => { setEditingItem(null); setFormData({}); setDialogOpen(true); };
  const handleEdit = (item: any) => { setEditingItem(item); setFormData({ ...item }); setDialogOpen(true); };

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
      if (submitData.is_sent !== undefined) submitData.is_sent = submitData.is_sent === 'true';
      if (submitData.is_read !== undefined) submitData.is_read = submitData.is_read === 'true';

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
    } catch (error) {
      setMessage({ type: 'error', text: "Không thể lưu dữ liệu" });
    }
  };

  const handleDelete = async (item: any) => {
    if (!selectedEntity) return;
    setMessage({ type: '', text: '' });
    try {
      const config = entityConfig[selectedEntity];
      const { error } = await supabase.from(config.entity as any).delete().eq('id', item.id);
      if (error) throw error;
      setMessage({ type: 'success', text: "Xóa thành công" });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: "Không thể xóa dữ liệu" });
    }
  };

  const toggleStaffLock = async (staff: any) => {
    setMessage({ type: '', text: '' });
    try {
      const newStatus = staff.account_status === 'active' ? 'locked' : 'active';
      const { error } = await supabase.from('staff').update({ account_status: newStatus, failed_login_attempts: 0 }).eq('id', staff.id);
      if (error) throw error;
      setMessage({ type: 'success', text: `Đã ${newStatus === 'locked' ? 'khóa' : 'mở khóa'} tài khoản` });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: "Không thể thay đổi trạng thái tài khoản" });
    }
  };

  const exportToCSV = () => { /* ... existing logic ... */ };
  const backupAllData = async () => { /* ... existing logic, replace toast with setMessage ... */ };
  const bulkDeleteTransactions = async () => { /* ... existing logic, replace toast with setMessage ... */ };

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
          {/* ... rest of the component ... */}
        </Tabs>
      </div>
    </Layout>
  );
};

export default DataManagement;