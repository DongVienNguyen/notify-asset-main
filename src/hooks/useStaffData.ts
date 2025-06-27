
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Staff Member interface
interface StaffMember {
  id: string;
  ten_nv: string;
  email: string;
}

export const useStaffData = () => {
  const [staff, setStaff] = useState<{ cbkh: StaffMember[]; cbqln: StaffMember[] }>({
    cbkh: [],
    cbqln: []
  });
  const { toast } = useToast();

  const loadStaffData = async () => {
    try {
      console.log('Loading staff data...');
      
      // Load CBKH staff with email
      console.log('Loading CBKH staff...');
      const { data: cbkhData, error: cbkhError } = await supabase
        .from('cbkh')
        .select('id, ten_nv, email')
        .order('ten_nv');

      if (cbkhError) {
        console.error('CBKH query error:', cbkhError);
        throw new Error(`CBKH load error: ${cbkhError.message}`);
      }

      console.log('CBKH data loaded:', cbkhData?.length || 0, 'records');

      // Load CBQLN staff with email
      console.log('Loading CBQLN staff...');
      const { data: cbqlnData, error: cbqlnError } = await supabase
        .from('cbqln')
        .select('id, ten_nv, email')
        .order('ten_nv');

      if (cbqlnError) {
        console.error('CBQLN query error:', cbqlnError);
        throw new Error(`CBQLN load error: ${cbqlnError.message}`);
      }

      console.log('CBQLN data loaded:', cbqlnData?.length || 0, 'records');

      // Update state with loaded data
      const cbkhStaff = (cbkhData || []).map(item => ({
        id: item.id,
        ten_nv: item.ten_nv,
        email: item.email
      }));

      const cbqlnStaff = (cbqlnData || []).map(item => ({
        id: item.id,
        ten_nv: item.ten_nv,
        email: item.email
      }));

      console.log('Setting asset staff state:', {
        cbkh: cbkhStaff.length,
        cbqln: cbqlnStaff.length
      });

      setStaff({
        cbkh: cbkhStaff,
        cbqln: cbqlnStaff
      });

      // Success message
      toast({
        title: "Thành công",
        description: `Đã tải ${cbkhStaff.length} CB KH và ${cbqlnStaff.length} CB QLN`,
      });

      return { cbkhStaff, cbqlnStaff };
    } catch (error: any) {
      console.error('Error loading staff data:', error);
      setStaff({ cbkh: [], cbqln: [] });
      toast({
        title: "Lỗi",
        description: `Không thể tải dữ liệu nhân viên: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    staff,
    setStaff,
    loadStaffData
  };
};
