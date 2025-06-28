
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DateInput from '@/components/DateInput';
import ComboBox from '@/components/ComboBox';

interface CRCReminderFormProps {
  editingReminder: any;
  loaiCRC: string;
  setLoaiCRC: (value: string) => void;
  ngayThucHien: string;
  setNgayThucHien: (value: string) => void;
  selectedLDPCRC: string;
  setSelectedLDPCRC: (value: string) => void;
  selectedCBCRC: string;
  setSelectedCBCRC: (value: string) => void;
  selectedQuyLCRC: string;
  setSelectedQuyLCRC: (value: string) => void;
  ldpcrcOptions: string[];
  cbcrcOptions: string[];
  quycrcOptions: string[];
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const CRCReminderForm: React.FC<CRCReminderFormProps> = ({
  editingReminder,
  loaiCRC,
  setLoaiCRC,
  ngayThucHien,
  setNgayThucHien,
  selectedLDPCRC,
  setSelectedLDPCRC,
  selectedCBCRC,
  setSelectedCBCRC,
  selectedQuyLCRC,
  setSelectedQuyLCRC,
  ldpcrcOptions,
  cbcrcOptions,
  quycrcOptions,
  onSubmit,
  onCancel,
  isLoading
}) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {editingReminder ? 'Chỉnh sửa nhắc nhở CRC' : 'Thêm nhắc nhở CRC mới'}
        </DialogTitle>
      </DialogHeader>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="loaiCRC">Loại báo tài CRC *</Label>
          <Input
            id="loaiCRC"
            value={loaiCRC}
            onChange={(e) => setLoaiCRC(e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="ngayThucHien">Ngày thực hiện (dd-MM) *</Label>
          <DateInput
            value={ngayThucHien}
            onChange={setNgayThucHien}
            placeholder="Nhập ngày thực hiện (dd-MM)"
          />
        </div>
        
        <div>
          <Label htmlFor="ldpcrc">LDP CRC</Label>
          <ComboBox
            value={selectedLDPCRC}
            onChange={setSelectedLDPCRC}
            options={ldpcrcOptions}
            placeholder="Chọn hoặc nhập LDP CRC"
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            {ldpcrcOptions.length > 0 
              ? `Có ${ldpcrcOptions.length} LDP CRC từ bảng ldpcrc`
              : 'Không có dữ liệu LDP CRC trong bảng ldpcrc'
            }
          </p>
        </div>
        
        <div>
          <Label htmlFor="cbcrc">CB CRC</Label>
          <ComboBox
            value={selectedCBCRC}
            onChange={setSelectedCBCRC}
            options={cbcrcOptions}
            placeholder="Chọn hoặc nhập CB CRC"
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            {cbcrcOptions.length > 0 
              ? `Có ${cbcrcOptions.length} CB CRC từ bảng cbcrc`
              : 'Không có dữ liệu CB CRC trong bảng cbcrc'
            }
          </p>
        </div>

        <div>
          <Label htmlFor="quycrc">Quy CRC</Label>
          <ComboBox
            value={selectedQuyLCRC}
            onChange={setSelectedQuyLCRC}
            options={quycrcOptions}
            placeholder="Chọn hoặc nhập Quy CRC"
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            {quycrcOptions.length > 0 
              ? `Có ${quycrcOptions.length} Quy CRC từ bảng quycrc`
              : 'Không có dữ liệu Quy CRC trong bảng quycrc'
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

export default CRCReminderForm;
