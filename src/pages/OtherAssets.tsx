import React, { useEffect } from 'react';
import { Archive, History } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useNavigate } from 'react-router-dom';
import { AssetHistoryManager } from '@/components/AssetHistoryManager';
import { useOtherAssets } from '@/hooks/useOtherAssets';
import OtherAssetForm from '@/components/OtherAssetForm';
import OtherAssetSearchBar from '@/components/OtherAssetSearchBar';
import OtherAssetTable from '@/components/OtherAssetTable';

const OtherAssets = () => {
  const { user } = useSecureAuth();
  const navigate = useNavigate();
  
  const {
    filteredAssets,
    isLoading,
    searchTerm,
    setSearchTerm,
    editingAsset,
    changeReason,
    setChangeReason,
    newAsset,
    setNewAsset,
    handleSave,
    editAsset,
    deleteAsset,
    clearForm,
    setEditingAsset
  } = useOtherAssets(user);

  // Check permissions
  useEffect(() => {
    if (user && user.department !== 'NQ' && user.role !== 'admin') {
      toast.error("Chỉ nhân viên phòng NQ và admin mới có thể truy cập module này", {
        description: "Không có quyền truy cập",
      });
      navigate('/');
      return;
    }
  }, [user, navigate]);

  const handleCancelEdit = () => {
    setEditingAsset(null);
    setChangeReason('');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full">
            <Archive className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tài sản, thùng khác gửi kho</h1>
            <p className="text-gray-600">Quản lý tài sản và thùng khác được gửi vào kho</p>
          </div>
        </div>

        <Tabs defaultValue="assets" className="w-full">
          <TabsList>
            <TabsTrigger value="assets" className="flex items-center">
              <Archive className="w-4 h-4 mr-2" />
              Quản lý tài sản
            </TabsTrigger>
            {user?.role === 'admin' && (
              <TabsTrigger value="history" className="flex items-center">
                <History className="w-4 h-4 mr-2" />
                Lịch sử thay đổi
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="assets" className="space-y-6">
            <OtherAssetForm
              newAsset={newAsset}
              setNewAsset={setNewAsset}
              editingAsset={editingAsset}
              changeReason={changeReason}
              setChangeReason={setChangeReason}
              isLoading={isLoading}
              onSave={handleSave}
              onClear={clearForm}
              onCancelEdit={handleCancelEdit}
            />

            <OtherAssetSearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filteredAssets={filteredAssets}
            />

            <OtherAssetTable
              filteredAssets={filteredAssets}
              user={user}
              onEdit={editAsset}
              onDelete={deleteAsset}
            />
          </TabsContent>

          {user?.role === 'admin' && (
            <TabsContent value="history">
              <AssetHistoryManager user={user} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default OtherAssets;