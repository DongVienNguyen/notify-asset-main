
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DateInput from '@/components/DateInput';
import ComboBox from '@/components/ComboBox';

interface AssetReminderFormProps {
  editingReminder: any;
  tenTaiSan: string;
  setTenTaiSan: (value: string) => void;
  ngayDenHan: string;
  setNgayDenHan: (value: string) => void;
  selectedCBKH: string;
  setSelectedCBKH: (value: string) => void;
  selectedCBQLN: string;
  setSelectedCBQLN: (value: string) => void;
  cbkhOptions: string[];
  cbqlnOptions: string[];
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const AssetReminderForm: React.FC<AssetReminderFormProps> = ({
  editingReminder,
  tenTaiSan,
  setTenTaiSan,
  ngayDenHan,
  setNgayDenHan,
  selectedCBKH,
  setSelectedCBKH,
  selectedCBQLN,
  setSelectedCBQLN,
  cbkhOptions,
  cbqlnOptions,
  onSubmit,
  onCancel,
  isLoading
}) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {editingReminder ? 'Chỉnh sửa nhắc nhở tài sản' : 'Thêm nhắc nhở tài sản mới'}
        </DialogTitle>
      </DialogHeader>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="tenTaiSan">Tên tài sản *</Label>
          <Input
            id="tenTaiSan"
            value={tenTaiSan}
            onChange={(e) => setTenTaiSan(e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="ngayDenHan">Ngày đến hạn (dd-MM) *</Label>
          <DateInput
            value={ngayDenHan}
            onChange={setNgayDenHan}
            placeholder="Nhập ngày đến hạn (dd-MM)"
          />
        </div>
        
        <div>
          <Label htmlFor="cbkh">Cán bộ KH</Label>
          <ComboBox
            value={selectedCBKH}
            onChange={setSelectedCBKH}
            options={cbkhOptions}
            placeholder="Chọn hoặc nhập cán bộ KH"
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            {cbkhOptions.length > 0 
              ? `Có ${cbkhOptions.length} cán bộ KH`
              : 'Không có dữ liệu cán bộ KH - hãy tạo dữ liệu test'
            }
          </p>
        </div>
        
        <div>
          <Label htmlFor="cbqln">Cán bộ QLN</Label>
          <ComboBox
            value={selectedCBQLN}
            onChange={setSelectedCBQLN}
            options={cbqlnOptions}
            placeholder="Chọn hoặc nhập cán bộ QLN"
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            {cbqlnOptions.length > 0 
              ? `Có ${cbqlnOptions.length} cán bộ QLN`
              : 'Không có dữ liệu cán bộ QLN - hãy tạo dữ liệu test'
            }
          </p>
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading}>
            {editingReminder ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default AssetReminderForm;
