import React from 'react';
import { AssetEntryFormState } from '@/types/assetEntryFormState';
import DateInput from '@/components/DateInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
      <div className="space-y-2 md:col-span-2"> {/* Changed to col-span-2 for better layout */}
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
    </div>
  );
};

export default TransactionDetails;