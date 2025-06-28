
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database, Settings } from 'lucide-react';

const TestDataButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createTestData = async () => {
    setIsLoading(true);
    try {
      console.log('Creating test data for CRC tables...');

      // Create test LDPCRC data
      const ldpcrcTestData = [
        { ten_nv: 'Lê Thị G', email: 'lethig' },
        { ten_nv: 'Nguyễn Văn H', email: 'nguyenvanh' },
        { ten_nv: 'Trần Văn I', email: 'tranvani' },
      ];

      // Create test CBCRC data
      const cbcrcTestData = [
        { ten_nv: 'Phạm Thị J', email: 'phamthij' },
        { ten_nv: 'Hoàng Văn K', email: 'hoangvank' },
        { ten_nv: 'Vũ Thị L', email: 'vuthil' },
      ];

      // Create test QUYCRC data
      const quycrcTestData = [
        { ten_nv: 'Lê Văn M', email: 'levanm' },
        { ten_nv: 'Nguyễn Thị N', email: 'nguyenthin' },
        { ten_nv: 'Trần Văn O', email: 'tranvano' },
      ];

      console.log('Inserting test data for LDPCRC...');
      const { data: ldpcrcResult, error: ldpcrcError } = await supabase
        .from('ldpcrc')
        .insert(ldpcrcTestData)
        .select();

      if (ldpcrcError) {
        console.error('Error inserting LDPCRC test data:', ldpcrcError);
        throw ldpcrcError;
      }

      console.log('Inserting test data for CBCRC...');
      const { data: cbcrcResult, error: cbcrcError } = await supabase
        .from('cbcrc')
        .insert(cbcrcTestData)
        .select();

      if (cbcrcError) {
        console.error('Error inserting CBCRC test data:', cbcrcError);
        throw cbcrcError;
      }

      console.log('Inserting test data for QUYCRC...');
      const { data: quycrcResult, error: quycrcError } = await supabase
        .from('quycrc')
        .insert(quycrcTestData)
        .select();

      if (quycrcError) {
        console.error('Error inserting QUYCRC test data:', quycrcError);
        throw quycrcError;
      }

      console.log('Test data created successfully:', {
        ldpcrc: ldpcrcResult?.length,
        cbcrc: cbcrcResult?.length,
        quycrc: quycrcResult?.length
      });

      toast({
        title: "Thành công",
        description: `Đã tạo ${ldpcrcResult?.length || 0} LDP CRC, ${cbcrcResult?.length || 0} CB CRC và ${quycrcResult?.length || 0} Quy CRC mẫu`,
      });

    } catch (error) {
      console.error('Error creating test data:', error);
      toast({
        title: "Lỗi",
        description: `Không thể tạo dữ liệu test: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    setIsLoading(true);
    try {
      console.log('Testing database connection...');

      // Test basic connection for CRC tables
      const { data: ldpcrcData, error: ldpcrcError } = await supabase.from('ldpcrc').select('count', { count: 'exact' });
      const { data: cbcrcData, error: cbcrcError } = await supabase.from('cbcrc').select('count', { count: 'exact' });
      const { data: quycrcData, error: quycrcError } = await supabase.from('quycrc').select('count', { count: 'exact' });
      const { data: crcRemindersData, error: crcRemindersError } = await supabase.from('crc_reminders').select('count', { count: 'exact' });
      const { data: sentCrcRemindersData, error: sentCrcRemindersError } = await supabase.from('sent_crc_reminders').select('count', { count: 'exact' });
      
      if (ldpcrcError || cbcrcError || quycrcError || crcRemindersError || sentCrcRemindersError) {
        const errors = [ldpcrcError, cbcrcError, quycrcError, crcRemindersError, sentCrcRemindersError].filter(Boolean);
        console.error('Connection test failed:', errors);
        throw new Error('Kết nối với một hoặc nhiều bảng CRC thất bại');
      }

      console.log('Connection test successful:', {
        ldpcrc: ldpcrcData,
        cbcrc: cbcrcData,
        quycrc: quycrcData,
        crc_reminders: crcRemindersData,
        sent_crc_reminders: sentCrcRemindersData
      });

      toast({
        title: "Kết nối thành công",
        description: "Tất cả các bảng CRC đã kết nối bình thường (LDPCRC, CBCRC, QUYCRC, CRC_REMINDERS, SENT_CRC_REMINDERS)",
      });

    } catch (error) {
      console.error('Connection test failed:', error);
      toast({
        title: "Lỗi kết nối",
        description: `Không thể kết nối database: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        onClick={testConnection} 
        variant="outline" 
        size="sm"
        disabled={isLoading}
      >
        <Database className="w-4 h-4 mr-2" />
        Test kết nối
      </Button>
      <Button 
        onClick={createTestData} 
        variant="outline" 
        size="sm"
        disabled={isLoading}
      >
        <Settings className="w-4 h-4 mr-2" />
        Tạo dữ liệu test
      </Button>
    </div>
  );
};

export default TestDataButton;
