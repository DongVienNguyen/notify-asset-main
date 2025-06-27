
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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

interface OtherAssetFormProps {
  newAsset: {
    name: string;
    deposit_date: string;
    depositor: string;
    deposit_receiver: string;
    withdrawal_date: string;
    withdrawal_deliverer: string;
    withdrawal_receiver: string;
    notes: string;
  };
  setNewAsset: React.Dispatch<React.SetStateAction<{
    name: string;
    deposit_date: string;
    depositor: string;
    deposit_receiver: string;
    withdrawal_date: string;
    withdrawal_deliverer: string;
    withdrawal_receiver: string;
    notes: string;
  }>>;
  editingAsset: OtherAsset | null;
  changeReason: string;
  setChangeReason: (reason: string) => void;
  isLoading: boolean;
  onSave: () => void;
  onClear: () => void;
  onCancelEdit: () => void;
}

const OtherAssetForm: React.FC<OtherAssetFormProps> = ({
  newAsset,
  setNewAsset,
  editingAsset,
  changeReason,
  setChangeReason,
  isLoading,
  onSave,
  onClear,
  onCancelEdit
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingAsset ? 'Chỉnh sửa tài sản' : 'Thêm mới tài sản gửi kho'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="name">Tên tài sản / thùng *</Label>
            <Input
              id="name"
              value={newAsset.name}
              onChange={(e) => setNewAsset(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nhập tên tài sản..."
            />
          </div>

          <div>
            <Label htmlFor="deposit_date">Ngày gửi kho *</Label>
            <Input
              id="deposit_date"
              type="date"
              value={newAsset.deposit_date}
              onChange={(e) => setNewAsset(prev => ({ ...prev, deposit_date: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="depositor">Người gửi kho</Label>
            <Input
              id="depositor"
              value={newAsset.depositor}
              onChange={(e) => setNewAsset(prev => ({ ...prev, depositor: e.target.value }))}
              placeholder="Nhập tên người gửi..."
            />
          </div>

          <div>
            <Label htmlFor="deposit_receiver">Người nhận (khi gửi)</Label>
            <Input
              id="deposit_receiver"
              value={newAsset.deposit_receiver}
              onChange={(e) => setNewAsset(prev => ({ ...prev, deposit_receiver: e.target.value }))}
              placeholder="Nhập tên người nhận..."
            />
          </div>

          <div>
            <Label htmlFor="withdrawal_date">Ngày xuất kho (nếu có)</Label>
            <Input
              id="withdrawal_date"
              type="date"
              value={newAsset.withdrawal_date}
              onChange={(e) => setNewAsset(prev => ({ ...prev, withdrawal_date: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="withdrawal_deliverer">Người giao (khi xuất)</Label>
            <Input
              id="withdrawal_deliverer"
              value={newAsset.withdrawal_deliverer}
              onChange={(e) => setNewAsset(prev => ({ ...prev, withdrawal_deliverer: e.target.value }))}
              placeholder="Nhập tên người giao..."
            />
          </div>

          <div>
            <Label htmlFor="withdrawal_receiver">Người nhận (khi xuất)</Label>
            <Input
              id="withdrawal_receiver"
              value={newAsset.withdrawal_receiver}
              onChange={(e) => setNewAsset(prev => ({ ...prev, withdrawal_receiver: e.target.value }))}
              placeholder="Nhập tên người nhận..."
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="notes">Ghi chú (thời gian sẽ được thêm tự động)</Label>
            <Input
              id="notes"
              value={newAsset.notes}
              onChange={(e) => setNewAsset(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Nhập ghi chú..."
            />
          </div>

          {editingAsset && (
            <div className="md:col-span-2">
              <Label htmlFor="change_reason">Lý do thay đổi *</Label>
              <Textarea
                id="change_reason"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="Nhập lý do thay đổi..."
              />
            </div>
          )}
        </div>

        <div className="flex space-x-4 mt-6">
          <Button variant="outline" onClick={onClear} disabled={isLoading}>
            Clear
          </Button>
          {editingAsset && (
            <Button variant="outline" onClick={onCancelEdit} disabled={isLoading}>
              Hủy
            </Button>
          )}
          <Button 
            onClick={onSave} 
            className="bg-indigo-600 hover:bg-indigo-700"
            disabled={isLoading || !newAsset.name.trim() || !newAsset.deposit_date}
          >
            {isLoading ? 'Đang lưu...' : (editingAsset ? 'Cập nhật' : 'Thêm mới')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OtherAssetForm;
