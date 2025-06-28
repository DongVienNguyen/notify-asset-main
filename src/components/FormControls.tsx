import React from 'react';
import { Building, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DateInput from './DateInput';
import { AssetEntryFormState } from '@/types/assetEntryFormState'; // Import the new interface

interface FormControlsProps {
  formData: AssetEntryFormState; // Use the new interface
  onRoomChange: (value: string) => void;
  onFormDataChange: (field: keyof AssetEntryFormState, value: string) => void; // Use the new interface
  showAssetInputs?: boolean;
}

const FormControls = ({ formData, onRoomChange, onFormDataChange, showAssetInputs = false }: FormControlsProps) => {
  if (showAssetInputs) {
    return (
      <>
        {/* Transaction Type */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Loại tác nghiệp Xuất/Mượn/Thay bìa</Label>
          <Select value={formData.transaction_type} onValueChange={(value) => onFormDataChange('transaction_type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn Mượn/Xuất TS/Thay bìa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Xuất kho">Xuất kho</SelectItem>
              <SelectItem value="Mượn TS">Mượn TS</SelectItem>
              <SelectItem value="Thay bìa">Thay bìa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date and Time */}
        <div className="space-y-4">
          <Label className="flex items-center text-base font-semibold">
            <Calendar className="w-5 h-5 mr-2 text-green-600" />
            Buổi và ngày lấy TS
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={formData.parts_day} onValueChange={(value) => onFormDataChange('parts_day', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn buổi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sáng">Sáng</SelectItem>
                <SelectItem value="Chiều">Chiều</SelectItem>
              </SelectContent>
            </Select>
            
            <DateInput
              value={formData.transaction_date}
              onChange={(value) => onFormDataChange('transaction_date', value)}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Room Selection */}
      <div className="space-y-4">
        <Label className="flex items-center text-base font-semibold">
          <Building className="w-5 h-5 mr-2 text-green-600" />
          Tài sản của phòng
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select value={formData.room} onValueChange={onRoomChange}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn phòng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="QLN">QLN</SelectItem>
              <SelectItem value="CMT8">CMT8</SelectItem>
              <SelectItem value="NS">NS</SelectItem>
              <SelectItem value="ĐS">ĐS</SelectItem>
              <SelectItem value="LĐH">LĐH</SelectItem>
              <SelectItem value="DVKH">DVKH</SelectItem>
            </SelectContent>
          </Select>
          
          {formData.room === 'QLN' && (
            <Input
              placeholder="Ghi chú tùy ý"
              value={formData.note}
              onChange={(e) => onFormDataChange('note', e.target.value)}
            />
          )}
          
          {['CMT8', 'NS', 'ĐS', 'LĐH'].includes(formData.room) && (
            <Select value={formData.note} onValueChange={(value) => onFormDataChange('note', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại giao nhận" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ship PGD">Ship PGD</SelectItem>
                <SelectItem value="Lấy ở CN">Lấy ở CN</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </>
  );
};

export default FormControls;