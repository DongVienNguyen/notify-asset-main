import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AssetEntryFormState } from '@/types/assetEntryFormState';

interface TransactionTypeSelectionProps {
  formData: AssetEntryFormState;
  onFormDataChange: (field: keyof AssetEntryFormState, value: string) => void;
}

const TransactionTypeSelection: React.FC<TransactionTypeSelectionProps> = ({ formData, onFormDataChange }) => {
  return (
    <div className="space-y-2">
      <Label>Loại tác nghiệp Xuất/Mượn/Thay bìa</Label>
      <Select
        value={formData.transaction_type}
        onValueChange={(value) => onFormDataChange('transaction_type', value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Chọn loại tác nghiệp" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Xuất kho">Xuất kho</SelectItem>
          <SelectItem value="Mượn TS">Mượn TS</SelectItem>
          <SelectItem value="Thay bìa">Thay bìa</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TransactionTypeSelection;