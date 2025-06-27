
import React, { useState, useEffect } from 'react';
import { History, Info, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

interface AssetHistoryManagerProps {
  user: any;
}

const AssetHistoryManager: React.FC<AssetHistoryManagerProps> = ({ user }) => {
  const [historyData, setHistoryData] = useState<AssetHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Function to load history data from the independent archive table
  const loadHistoryData = async () => {
    if (!user || user.role !== 'admin') {
      console.log('User is not admin, skipping history load');
      return;
    }
    
    setIsLoading(true);
    console.log('=== LOADING HISTORY FROM ARCHIVE TABLE ===');
    
    try {
      // Direct query to asset_history_archive table
      console.log('Querying asset_history_archive directly...');
      
      const { data, error, count } = await supabase
        .from('asset_history_archive')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(100);
      
      console.log('Query result:', { 
        data: data, 
        error: error, 
        count: count,
        dataLength: data?.length 
      });
      
      if (error) {
        console.error('Archive query error:', error);
        throw error;
      }
      
      console.log('✅ Archive history query successful:', data?.length || 0, 'records');
      if (data && data.length > 0) {
        console.log('Sample record:', data[0]);
      }
      setHistoryData(data || []);
      
    } catch (error) {
      console.error('=== LOAD ARCHIVE HISTORY ERROR ===');
      console.error('Error:', error);
      
      toast({
        title: "Lỗi",
        description: "Không thể tải lịch sử: " + (error as Error).message,
        variant: "destructive",
      });
      setHistoryData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to delete a history record
  const deleteHistoryRecord = async (historyId: string, assetName: string) => {
    if (!user || user.role !== 'admin') {
      toast({
        title: "Không có quyền",
        description: "Chỉ admin mới có thể xóa lịch sử",
        variant: "destructive",
      });
      return;
    }

    // Confirm deletion
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bản ghi lịch sử của "${assetName}"?`)) {
      return;
    }

    setIsLoading(true);
    console.log('=== DELETING HISTORY RECORD ===');
    console.log('History ID:', historyId);

    try {
      const { error } = await supabase
        .from('asset_history_archive')
        .delete()
        .eq('id', historyId);

      if (error) {
        console.error('Delete history error:', error);
        throw error;
      }

      console.log('History record deleted successfully');

      // Refresh the history data
      await loadHistoryData();

      toast({
        title: "Thành công",
        description: "Xóa bản ghi lịch sử thành công",
      });

    } catch (error) {
      console.error('=== DELETE HISTORY ERROR ===');
      console.error('Error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa bản ghi lịch sử: " + (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount và khi user thay đổi
  useEffect(() => {
    loadHistoryData();
  }, [user]);

  // Manual refresh function
  const handleRefresh = () => {
    console.log('=== MANUAL REFRESH TRIGGERED ===');
    loadHistoryData();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Lịch sử thay đổi ({historyData.length} bản ghi)</span>
          <div className="flex space-x-2">
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm" 
              disabled={isLoading}
              className="flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
            {user?.role === 'admin' && (
              <Button 
                onClick={() => {
                  console.log('=== DEBUG INFO ===');
                  console.log('Current user:', user);
                  console.log('History data:', historyData);
                  console.log('Loading state:', isLoading);
                }} 
                variant="outline" 
                size="sm"
              >
                Debug
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2">Đang tải lịch sử...</span>
          </div>
        ) : historyData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="space-y-2">
              <p>Chưa có lịch sử thay đổi nào</p>
              <p className="text-sm">Thử thực hiện thao tác thêm/sửa/xóa tài sản để tạo lịch sử</p>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Thử lại
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
              ✅ Đã tìm thấy {historyData.length} bản ghi lịch sử (Lưu trữ độc lập)
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Tài sản</TableHead>
                  <TableHead>Tên tài sản</TableHead>
                  <TableHead>Loại thay đổi</TableHead>
                  <TableHead>Người thay đổi</TableHead>
                  <TableHead>Lý do</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyData.map((history, index) => (
                  <TableRow key={history.id || index}>
                    <TableCell className="font-mono text-xs">{history.original_asset_id?.slice(0, 8) || 'N/A'}...</TableCell>
                    <TableCell>{history.asset_name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={history.change_type === 'delete' ? 'destructive' : 'default'}>
                        {history.change_type === 'delete' ? 'Xóa' : 
                         history.change_type === 'update' ? 'Cập nhật' : 'Tạo mới'}
                      </Badge>
                    </TableCell>
                    <TableCell>{history.changed_by || 'N/A'}</TableCell>
                    <TableCell className="max-w-xs truncate">{history.change_reason || 'N/A'}</TableCell>
                    <TableCell>
                      {history.created_at ? new Date(history.created_at).toLocaleString('vi-VN') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            console.log('History detail:', history);
                            toast({
                              title: "Chi tiết lịch sử",
                              description: `${history.change_type} by ${history.changed_by}`,
                            });
                          }}
                        >
                          <Info className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => deleteHistoryRecord(history.id, history.asset_name)}
                          disabled={isLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { AssetHistoryManager };
export type { AssetHistory };
