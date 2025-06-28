import React from 'react';
import { Building } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AssetEntryFormState } from '@/types/assetEntryFormState';

interface RoomSelectionProps {
  formData: AssetEntryFormState;
  onRoomChange: (value: string) => void;
  onFormDataChange: (field: keyof AssetEntryFormState, value: string) => void;
}

const RoomSelection = ({ formData, onRoomChange, onFormDataChange }: RoomSelectionProps) => {
  return (
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
            value={formData.note || ''}
            onChange={(e) => onFormDataChange('note', e.target.value)}
          />
        )}
        
        {['CMT8', 'NS', 'ĐS', 'LĐH'].includes(formData.room) && (
          <Select value={formData.note || ''} onValueChange={(value) => onFormDataChange('note', value)}>
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
  );
};

export default RoomSelection;