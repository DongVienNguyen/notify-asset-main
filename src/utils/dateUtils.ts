import { format, parse, isValid } from 'date-fns';

/**
 * Parses a date string in "dd-MM" format and returns a Date object for the current year.
 * @param dateStr The date string in "dd-MM" format.
 * @returns A Date object or null if invalid.
 */
export const parseDayMonthString = (dateStr: string): Date | null => {
  if (!/^\d{2}-\d{2}$/.test(dateStr)) return null;
  const date = parse(dateStr, 'dd-MM', new Date());
  return isValid(date) ? date : null;
};

/**
 * Checks if a date string (dd-MM) is today or in the past.
 * @param dateStr The date string in "dd-MM" format.
 * @returns True if the date is due or overdue, false otherwise.
 */
export const isDayMonthDueOrOverdue = (dateStr: string): boolean => {
  try {
    const dueDate = parseDayMonthString(dateStr);
    if (!dueDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    dueDate.setHours(0, 0, 0, 0); // Reset time to start of day
    
    return dueDate <= today;
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
    return false;
  }
};

/**
 * Formats a date string (like YYYY-MM-DD) or a Date object into dd/MM/yyyy format.
 * Handles timezone offsets to prevent off-by-one day errors.
 * @param date The date string or Date object.
 * @returns The formatted date string or an empty string if invalid.
 */
export const formatToDDMMYYYY = (date: string | Date | undefined | null): string => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!isValid(dateObj)) return '';
    // Add timezone offset to prevent off-by-one day errors
    const correctedDate = new Date(dateObj.valueOf() + dateObj.getTimezoneOffset() * 60 * 1000);
    return format(correctedDate, 'dd/MM/yyyy');
  } catch (error) {
    console.error('Error formatting date:', date, error);
    return '';
  }
};