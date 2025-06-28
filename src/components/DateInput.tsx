import React from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DateInputProps {
  value: string; // Expected format: YYYY-MM-DD
  onChange: (value: string) => void; // Returns format: YYYY-MM-DD
  placeholder?: string;
  className?: string;
}

const DateInput: React.FC<DateInputProps> = ({ value, onChange, placeholder, className }) => {
  // Convert YYYY-MM-DD string to Date object for react-day-picker
  // parseISO creates a Date object in local time.
  const selectedDate = value ? (isValid(parseISO(value)) ? parseISO(value) : undefined) : undefined;

  const handleDateSelect = (date: Date | undefined) => {
    // Convert selected Date object (local time) back to YYYY-MM-DD string
    onChange(date ? format(date, 'yyyy-MM-dd') : '');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(parseISO(value), "dd/MM/yyyy") : (placeholder || "dd/MM/yyyy")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

export default DateInput;