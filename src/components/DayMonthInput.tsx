import React from 'react';
import { Input } from '@/components/ui/input';

interface DayMonthInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const DayMonthInput: React.FC<DayMonthInputProps> = ({ value, onChange, placeholder, className }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Allow only numbers and hyphens, and limit length
    const sanitizedInput = input.replace(/[^0-9-]/g, '').slice(0, 5);
    onChange(sanitizedInput);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    let finalValue = e.target.value; // Default to current value

    if (rawValue.length === 3) {
      const day = rawValue.substring(0, 2);
      const month = `0${rawValue.substring(2, 3)}`;
      finalValue = `${day}-${month}`;
    } else if (rawValue.length === 4) {
      const day = rawValue.substring(0, 2);
      const month = rawValue.substring(2, 4);
      finalValue = `${day}-${month}`;
    }
    
    // Validate and format parts
    const parts = finalValue.split('-');
    if (parts.length === 2) {
      let [day, month] = parts;
      if (parseInt(day, 10) > 31) day = '31';
      if (parseInt(month, 10) > 12) month = '12';
      if (day.length === 1) day = `0${day}`;
      if (month.length === 1) month = `0${month}`;
      finalValue = `${day}-${month}`;
    }

    onChange(finalValue);
  };

  return (
    <Input
      value={value}
      onChange={handleInputChange}
      onBlur={handleBlur}
      placeholder={placeholder || 'dd-MM'}
      className={className}
      maxLength={5}
    />
  );
};

export default DayMonthInput;