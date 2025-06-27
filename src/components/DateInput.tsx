
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const DateInput: React.FC<DateInputProps> = ({ value, onChange, placeholder, className }) => {
  const [displayValue, setDisplayValue] = useState(value);

  const formatDateInput = (input: string) => {
    // Remove all non-digit characters
    const digits = input.replace(/\D/g, '');
    
    // Auto-format when user enters 3 or 4 digits to dd/MM format
    if (digits.length >= 3 && digits.length <= 4) {
      const day = digits.substring(0, 2);
      const month = digits.substring(2);
      return `${day}/${month}`;
    }
    
    return digits;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // If user is typing and has 3-4 digits, auto-format to dd/MM
    if (/^\d{3,4}$/.test(input.replace(/\D/g, ''))) {
      const formatted = formatDateInput(input);
      setDisplayValue(formatted);
      onChange(formatted);
    } else {
      setDisplayValue(input);
      onChange(input);
    }
  };

  return (
    <Input
      value={displayValue}
      onChange={handleInputChange}
      placeholder={placeholder || "dd/MM"}
      className={className}
    />
  );
};

export default DateInput;
