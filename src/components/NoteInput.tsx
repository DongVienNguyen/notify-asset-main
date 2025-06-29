import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AssetEntryFormState } from '@/types/assetEntryFormState';

interface NoteInputProps {
  formData: AssetEntryFormState;
  onFormDataChange: (field: keyof AssetEntryFormState, value: string) => void;
}

const NoteInput: React.FC<NoteInputProps> = ({ formData, onFormDataChange }) => {
  return (
    <div className="space-y-2">
      <Label>Ghi chú (nếu có)</Label>
      <Input
        value={formData.note || ''}
        onChange={(e) => onFormDataChange('note', e.target.value)}
        placeholder="Nhập ghi chú..."
      />
    </div>
  );
};

export default NoteInput;