import React, { useState } from 'react';
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
  disabledBefore?: Date; // New prop to disable past dates
}

const DateInput: React.FC<DateInputProps> = ({ value, onChange, placeholder, className, disabledBefore }) => {
  const [open, setOpen] = useState(false);
  // Convert YYYY-MM-DD string to Date object for react-day-picker
  // parseISO creates a Date object in local time.
  const selectedDate = value ? (isValid(parseISO(value)) ? parseISO(value) : undefined) : undefined;

  const handleDateSelect = (date: Date | undefined) => {
    // If a date is selected, format it and pass to onChange
    if (date) {
      onChange(format(date, 'yyyy-MM-dd'));
    } else {
      // If date is undefined (meaning the user clicked the already selected date to deselect it),
      // set the value to an empty string to clear it.
      onChange(''); 
    }
    setOpen(false); // Always close popover on select/deselect attempt
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
          disabled={disabledBefore ? { before: disabledBefore } : undefined}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

export default DateInput;