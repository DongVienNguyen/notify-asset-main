import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner'; // Changed import from useToast to toast from sonner

interface AssetHistory {
  id: string;
  original_asset_id: string;
  asset_name: string;
  change_type: string;
  changed_by: string;
  change_reason: string;
  old_data: any;
  new_data: any;
  created_at: string;
}

export const useAssetHistory = (user: any) => {
  const [isLoading, setIsLoading] = useState(false);

  // Save history record to the independent archive table
  const saveHistory = async (historyRecord: {
    asset_id: string;
    asset_name: string;
    change_type: 'create' | 'update' | 'delete';
    changed_by: string;
    change_reason: string;
    old_data?: any;
    new_data?: any;
  }) => {
    console.log('=== SAVING HISTORY TO ARCHIVE TABLE ===');
    console.log('History record:', historyRecord);
    
    if (!user?.username) {
      console.error('No user context available for history');
      return null;
    }

    setIsLoading(true);
    
    try {
      // Prepare data for the independent archive table
      const archiveData = {
        original_asset_id: historyRecord.asset_id,
        asset_name: historyRecord.asset_name,
        change_type: historyRecord.change_type,
        changed_by: historyRecord.changed_by,
        change_reason: historyRecord.change_reason,
        old_data: historyRecord.old_data || null,
        new_data: historyRecord.new_data || null
      };

      console.log('Inserting to asset_history_archive:', archiveData);

      // Direct insert to independent archive table
      const { data, error } = await supabase
        .from('asset_history_archive')
        .insert([archiveData])
        .select();

      if (error) {
        console.error('Archive insert error:', error);
        throw error;
      }

      console.log('✅ History archived successfully:', data);
      setIsLoading(false);
      return data?.[0] || null;
        
    } catch (error) {
      console.error('=== ARCHIVE SAVE ERROR ===');
      console.error('Error:', error);
      
      // Don't show error toast for delete operations to avoid annoying user
      if (historyRecord.change_type !== 'delete') {
        toast.error("Cảnh báo", { // Changed toast call
          description: "Không thể lưu lịch sử thay đổi",
        });
      }
      
      setIsLoading(false);
      return null;
    }
  };

  return {
    saveHistory,
    isLoading
  };
};