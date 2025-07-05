import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Staff, StaffMember } from '@/types/staff'; // Import Staff and StaffMember types

export const useStaffData = () => {
  const [staff, setStaff] = useState<Staff>({
    cbqln: [],
    cbkh: [],
    ldpcrc: [],
    cbcrc: [],
    quycrc: [],
  });

  const loadStaffData = async () => {
    try {
      const { data: cbqlnData, error: cbqlnError } = await supabase
        .from('cbqln')
        .select('id, ten_nv, email');
      if (cbqlnError) throw cbqlnError;

      const { data: cbkhData, error: cbkhError } = await supabase
        .from('cbkh')
        .select('id, ten_nv, email');
      if (cbkhError) throw cbkhError;

      const { data: ldpcrcData, error: ldpcrcError } = await supabase
        .from('ldpcrc')
        .select('id, ten_nv, email');
      if (ldpcrcError) throw ldpcrcError;

      const { data: cbcrcData, error: cbcrcError } = await supabase
        .from('cbcrc')
        .select('id, ten_nv, email');
      if (cbcrcError) throw cbcrcError;

      const { data: quycrcData, error: quycrcError } = await supabase
        .from('quycrc')
        .select('id, ten_nv, email');
      if (quycrcError) throw quycrcError;

      setStaff({
        cbqln: cbqlnData || [],
        cbkh: cbkhData || [],
        ldpcrc: ldpcrcData || [],
        cbcrc: cbcrcData || [],
        quycrc: quycrcData || [],
      });
    } catch (error) {
      console.error('Error loading staff data:', error);
      // Optionally, set an error state or show a toast
    }
  };

  useEffect(() => {
    loadStaffData();
  }, []);

  return { staff, loadStaffData };
};