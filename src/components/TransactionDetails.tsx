import React from 'react';
import { Calendar } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DateInput from './DateInput';
import { AssetEntryFormState } from '@/types/assetEntryFormState';

interface TransactionDetailsProps {
  formData: AssetEntryFormState;
  onFormDataChange: (field: keyof AssetEntryFormState, value: string) => void;
}

const TransactionDetails = ({ formData, onFormDataChange }: TransactionDetailsProps) => {
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
};

export default TransactionDetails;