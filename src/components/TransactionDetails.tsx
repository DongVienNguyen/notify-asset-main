import React from 'react';
import { AssetEntryFormState } from '@/types/assetEntryFormState';
import DateInput from '@/components/DateInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TransactionDetailsProps {
  formData: AssetEntryFormState;
  setFormData: React.Dispatch<React.SetStateAction<AssetEntryFormState>>;
  disabledBeforeDate?: Date;
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({ formData, setFormData, disabledBeforeDate }) => {
  const handleInputChange = (field: keyof AssetEntryFormState, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Buổi và ngày lấy TS */}
      <div className="space-y-2">
        <Label>Buổi và ngày lấy TS</Label>
        <div className="grid grid-cols-2 gap-2">
          <Select
            value={formData.parts_day}
            onValueChange={(value) => handleInputChange('parts_day', value)}
          >
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
            onChange={(date) => handleInputChange('transaction_date', date)}
            disabledBefore={disabledBeforeDate}
          />
        </div>
      </div>

      {/* Loại giao dịch */}
      <div className="space-y-2">
        <Label>Loại giao dịch</Label>
        <Select
          value={formData.transaction_type}
          onValueChange={(value) => handleInputChange('transaction_type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn loại giao dịch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Mượn">Mượn</SelectItem>
            <SelectItem value="Xuất">Xuất</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Ghi chú (nếu có) */}
      <div className="space-y-2 md:col-span-2">
        <Label>Ghi chú (nếu có)</Label>
        <Input
          value={formData.note || ''}
          onChange={(e) => handleInputChange('note', e.target.value)}
          placeholder="Nhập ghi chú..."
        />
      </div>
    </div>
  );
};

export default TransactionDetails;