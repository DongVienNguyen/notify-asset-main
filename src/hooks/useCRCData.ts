
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StaffMember {
  id: string;
  ten_nv: string;
  email: string;
}

interface CRCReminder {
  id: string;
  loai_bt_crc: string;
  ngay_thuc_hien: string;
  ldpcrc: string | null;
  cbcrc: string | null;
  quycrc: string | null;
  is_sent: boolean;
  created_at: string;
}

interface SentCRCReminder {
  id: string;
  loai_bt_crc: string;
  ngay_thuc_hien: string;
  ldpcrc: string | null;
  cbcrc: string | null;
  quycrc: string | null;
  is_sent: boolean;
  sent_date: string;
  created_at: string;
}

interface CRCStaff {
  ldpcrc: StaffMember[];
  cbcrc: StaffMember[];
  quycrc: StaffMember[];
}

interface CRCDataState {
  staff: CRCStaff;
  reminders: CRCReminder[];
  sentReminders: SentCRCReminder[];
  isLoading: boolean;
  error: string | null;
}

export const useCRCData = () => {
  const { toast } = useToast();
  const [data, setData] = useState<CRCDataState>({
    staff: { ldpcrc: [], cbcrc: [], quycrc: [] },
    reminders: [],
    sentReminders: [],
    isLoading: false,
    error: null
  });

  const loadAllData = useCallback(async () => {
    console.log('🔄 Starting CRC data load with new open policies...');
    setData(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Load all data in parallel with simplified queries
      const [ldpcrcResult, cbcrcResult, quycrcResult, remindersResult, sentRemindersResult] = await Promise.all([
        supabase.from('ldpcrc').select('*').order('ten_nv'),
        supabase.from('cbcrc').select('*').order('ten_nv'), 
        supabase.from('quycrc').select('*').order('ten_nv'),
        supabase.from('crc_reminders').select('*').order('ngay_thuc_hien'),
        supabase.from('sent_crc_reminders').select('*').order('sent_date', { ascending: false })
      ]);

      console.log('📊 Data load results:', {
        ldpcrc: { error: ldpcrcResult.error, count: ldpcrcResult.data?.length || 0 },
        cbcrc: { error: cbcrcResult.error, count: cbcrcResult.data?.length || 0 },
        quycrc: { error: quycrcResult.error, count: quycrcResult.data?.length || 0 },
        reminders: { error: remindersResult.error, count: remindersResult.data?.length || 0 },
        sentReminders: { error: sentRemindersResult.error, count: sentRemindersResult.data?.length || 0 }
      });

      // Check for errors
      const errors = [
        ldpcrcResult.error,
        cbcrcResult.error, 
        quycrcResult.error,
        remindersResult.error,
        sentRemindersResult.error
      ].filter(Boolean);

      if (errors.length > 0) {
        console.error('❌ Errors loading data:', errors);
        throw new Error(`Lỗi tải dữ liệu: ${errors.map(e => e.message).join(', ')}`);
      }

      // Process successful results
      const staff: CRCStaff = {
        ldpcrc: ldpcrcResult.data || [],
        cbcrc: cbcrcResult.data || [],
        quycrc: quycrcResult.data || []
      };

      const reminders = remindersResult.data || [];
      const sentReminders = sentRemindersResult.data || [];

      console.log('✅ Successfully loaded CRC data:', {
        totalStaff: staff.ldpcrc.length + staff.cbcrc.length + staff.quycrc.length,
        reminders: reminders.length,
        sentReminders: sentReminders.length
      });

      setData({
        staff,
        reminders,
        sentReminders,
        isLoading: false,
        error: null
      });

      // Show success message
      const totalStaff = staff.ldpcrc.length + staff.cbcrc.length + staff.quycrc.length;
      toast({
        title: "✅ Thành công",
        description: `Đã tải ${totalStaff} cán bộ CRC, ${reminders.length} nhắc nhở, ${sentReminders.length} đã gửi`,
      });

    } catch (error) {
      console.error('💥 Critical error loading CRC data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      toast({
        title: "❌ Lỗi",
        description: `Không thể tải dữ liệu CRC: ${errorMessage}`,
        variant: "destructive",
      });
    }
  }, [toast]);

  const refreshData = useCallback(() => {
    console.log('🔄 Refreshing CRC data...');
    return loadAllData();
  }, [loadAllData]);

  const testConnection = useCallback(async () => {
    console.log('🔍 Testing database connections with new policies...');
    
    try {
      const testQueries = [
        { name: 'ldpcrc', query: supabase.from('ldpcrc').select('count') },
        { name: 'cbcrc', query: supabase.from('cbcrc').select('count') },
        { name: 'quycrc', query: supabase.from('quycrc').select('count') },
        { name: 'crc_reminders', query: supabase.from('crc_reminders').select('count') },
        { name: 'sent_crc_reminders', query: supabase.from('sent_crc_reminders').select('count') }
      ];

      const results = await Promise.all(testQueries.map(t => t.query));
      
      testQueries.forEach((test, index) => {
        const result = results[index];
        if (result.error) {
          console.error(`❌ ${test.name} connection error:`, result.error);
        } else {
          console.log(`✅ ${test.name} connection OK`);
        }
      });

      toast({
        title: "🔍 Test kết nối hoàn tất",
        description: "Kiểm tra console để xem chi tiết",
      });

    } catch (error) {
      console.error('💥 Connection test failed:', error);
      toast({
        title: "❌ Test kết nối thất bại", 
        description: "Kiểm tra console để xem lỗi",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    ...data,
    loadAllData,
    refreshData,
    testConnection
  };
};
