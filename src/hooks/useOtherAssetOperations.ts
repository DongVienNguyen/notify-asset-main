import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast'; // Corrected import path
import { useAssetHistory } from '@/hooks/useAssetHistory';
import { setCurrentUserContext, createNotesWithTimestamp } from '@/utils/otherAssetUtils';

interface OtherAsset {
  id: string;
  name: string;
  deposit_date: string;
  depositor: string;
  deposit_receiver: string;
  withdrawal_date?: string;
  withdrawal_deliverer?: string;
  withdrawal_receiver?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useOtherAssetOperations = (user: any) => {
  const { toast } = useToast();
  const { saveHistory } = useAssetHistory(user);

  const loadAssets = async () => {
    if (!user) return [];
    
    try {
      console.log('Loading other assets data...');
      
      await setCurrentUserContext(user);
      
      const { data: assetsData, error: assetsError } = await supabase
        .from('other_assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (assetsError) {
        console.error('Error loading assets:', assetsError);
        throw assetsError;
      }
      
      console.log('Assets loaded:', assetsData);
      return assetsData || [];

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu: " + (error as Error).message,
        variant: "destructive",
      });
      return [];
    }
  };

  const saveAsset = async (
    newAsset: any,
    editingAsset: OtherAsset | null,
    changeReason: string
  ) => {
    console.log('=== STARTING SAVE OPERATION ===');
    
    if (!newAsset.name.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên tài sản",
        variant: "destructive",
      });
      return false;
    }

    if (!newAsset.deposit_date) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ngày gửi kho",
        variant: "destructive",
      });
      return false;
    }

    if (editingAsset && !changeReason.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập lý do thay đổi",
        variant: "destructive",
      });
      return false;
    }

    try {
      await setCurrentUserContext(user);
      
      const notesWithTimestamp = createNotesWithTimestamp(newAsset.notes, !!editingAsset);

      console.log('DEBUG: newAsset.deposit_date before processing:', newAsset.deposit_date);
      const assetData = {
        name: newAsset.name.trim(),
        deposit_date: newAsset.deposit_date.trim() === '' ? null : newAsset.deposit_date, // Chuyển chuỗi rỗng hoặc chỉ khoảng trắng thành NULL
        depositor: newAsset.depositor?.trim() || null,
        deposit_receiver: newAsset.deposit_receiver?.trim() || null,
        withdrawal_date: newAsset.withdrawal_date.trim() === '' ? null : newAsset.withdrawal_date, // Áp dụng tương tự cho withdrawal_date
        withdrawal_deliverer: newAsset.withdrawal_deliverer?.trim() || null,
        withdrawal_receiver: newAsset.withdrawal_receiver?.trim() || null,
        notes: notesWithTimestamp
      };
      console.log('DEBUG: assetData.deposit_date sent to DB:', assetData.deposit_date);
      console.log('DEBUG: Full assetData payload:', assetData); // Log toàn bộ payload

      if (editingAsset) {
        const { data: updatedAsset, error: updateError } = await supabase
          .from('other_assets')
          .update(assetData)
          .eq('id', editingAsset.id)
          .select();

        if (updateError) {
          console.error('Asset update error:', updateError);
          throw updateError;
        }

        if (user?.username && updatedAsset?.[0]) {
          const oldDataForHistory = {
            id: editingAsset.id,
            name: editingAsset.name,
            deposit_date: editingAsset.deposit_date,
            depositor: editingAsset.depositor,
            deposit_receiver: editingAsset.deposit_receiver,
            withdrawal_date: editingAsset.withdrawal_date,
            withdrawal_deliverer: editingAsset.withdrawal_deliverer,
            withdrawal_receiver: editingAsset.withdrawal_receiver,
            notes: editingAsset.notes,
            created_at: editingAsset.created_at,
            updated_at: editingAsset.updated_at
          };

          await saveHistory({
            asset_id: editingAsset.id,
            asset_name: editingAsset.name,
            change_type: 'update',
            changed_by: user.username,
            change_reason: changeReason,
            old_data: oldDataForHistory,
            new_data: updatedAsset[0]
          });
        }
        
        toast({
          title: "Thành công",
          description: "Cập nhật tài sản thành công",
        });
      } else {
        const { data: newAssetData, error: insertError } = await supabase
          .from('other_assets')
          .insert([assetData])
          .select();

        if (insertError) {
          console.error('Asset insert error:', insertError);
          throw insertError;
        }

        if (user?.username && newAssetData?.[0]) {
          await saveHistory({
            asset_id: newAssetData[0].id,
            asset_name: newAssetData[0].name,
            change_type: 'create',
            changed_by: user.username,
            change_reason: 'Tạo mới tài sản',
            new_data: newAssetData[0]
          });
        }
        
        toast({
          title: "Thành công",
          description: "Thêm tài sản thành công",
        });
      }

      return true;
    } catch (error) {
      console.error('=== SAVE OPERATION ERROR ===');
      console.error('Error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu tài sản: " + (error as Error).message,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteAsset = async (asset: OtherAsset) => {
    if (!user || user.role !== 'admin') {
      toast({
        title: "Không có quyền",
        description: "Chỉ admin mới có thể xóa",
        variant: "destructive",
      });
      return false;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài sản "${asset.name}"?`)) {
      return false;
    }
    
    try {
      console.log('=== DELETING ASSET WITH ENHANCED HISTORY ===');
      
      await setCurrentUserContext(user);
      
      if (user?.username) {
        const oldDataForHistory = {
          id: asset.id,
          name: asset.name,
          deposit_date: asset.deposit_date,
          depositor: asset.depositor,
          deposit_receiver: asset.deposit_receiver,
          withdrawal_date: asset.withdrawal_date,
          withdrawal_deliverer: asset.withdrawal_deliverer,
          withdrawal_receiver: asset.withdrawal_receiver,
          notes: asset.notes,
          created_at: asset.created_at,
          updated_at: asset.updated_at
        };

        await saveHistory({
          asset_id: asset.id,
          asset_name: asset.name,
          change_type: 'delete',
          changed_by: user.username,
          change_reason: 'Xóa tài sản',
          old_data: oldDataForHistory
        });

        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          const { data: historyCheck } = await supabase
            .from('asset_history_archive')
            .select('id')
            .eq('original_asset_id', asset.id)
            .eq('change_type', 'delete')
            .eq('changed_by', user.username);
          
          if (!historyCheck || historyCheck.length === 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            await saveHistory({
              asset_id: asset.id,
              asset_name: asset.name,
              change_type: 'delete',
              changed_by: user.username,
              change_reason: 'Xóa tài sản (retry)',
              old_data: oldDataForHistory
            });
          }
        } catch (verifyError) {
          console.error('History verification error:', verifyError);
        }
      }

      const { error: deleteError } = await supabase
        .from('other_assets')
        .delete()
        .eq('id', asset.id);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw deleteError;
      }

      toast({
        title: "Thành công",
        description: "Xóa tài sản thành công và đã lưu lịch sử",
      });
      
      return true;
    } catch (error) {
      console.error('=== DELETE ERROR ===');
      console.error('Error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa tài sản: " + (error as Error).message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    loadAssets,
    saveAsset,
    deleteAsset
  };
};