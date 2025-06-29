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

// --- Helper Functions for Asset Entry Date ---

/** Gets the current date in GMT+7 timezone. */
export const getGMTPlus7Date = () => new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));

/**
 * Calculates the next working day (skips Saturday and Sunday).
 * @param date The starting date.
 * @returns The next working day as a Date object.
 */
export const getNextWorkingDay = (date: Date): Date => {
  const day = date.getDay();
  let nextDay = new Date(date);
  if (day === 5) nextDay.setDate(date.getDate() + 3); // Friday -> Monday
  else if (day === 6) nextDay.setDate(date.getDate() + 2); // Saturday -> Monday
  else nextDay.setDate(date.getDate() + 1);
  return nextDay;
};

/**
 * Helper to get the effective date, skipping weekends by moving to the next Monday.
 * @param date The starting date.
 * @returns The date if it's a weekday, or the next Monday if it's a weekend.
 */
const getEffectiveDate = (date: Date): Date => {
    const effectiveDate = new Date(date);
    const day = effectiveDate.getDay();
    if (day === 6) { // Saturday
        effectiveDate.setDate(effectiveDate.getDate() + 2);
    } else if (day === 0) { // Sunday
        effectiveDate.setDate(effectiveDate.getDate() + 1);
    }
    return effectiveDate;
};

/**
 * Determines the default transaction date and disabled date range based on the current time.
 * @returns An object with `defaultDate` (YYYY-MM-DD) and `disabledBefore` (Date object).
 */
export const getTransactionDateRules = () => {
  const now = getGMTPlus7Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // Time window for "Chiều" shift: 08:00 - 12:45
  const isMorningWindow = (hours >= 8) && (hours < 12 || (hour === 12 && minutes <= 45));

  let defaultDate: Date;

  if (isMorningWindow) {
    // In the morning window, the default is the current working day.
    defaultDate = getEffectiveDate(now);
  } else {
    // Outside the morning window, the default is the next working day.
    defaultDate = getNextWorkingDay(now);
  }
  
  // Users cannot select any day before the calculated default date.
  const disabledBefore = new Date(defaultDate);
  disabledBefore.setHours(0, 0, 0, 0);

  return {
    defaultDate: format(defaultDate, 'yyyy-MM-dd'),
    disabledBefore: disabledBefore,
  };
};


// --- New Helper Functions for Daily Report ---

/**
 * Determines the target date for the morning report based on the current time.
 * If it's after 08:06 AM, it returns the next working day. Otherwise, it returns the current day.
 * @returns The target date as a Date object.
 */
export const getDateBasedOnTime = (): Date => {
  const gmtPlus7 = getGMTPlus7Date();
  const hours = gmtPlus7.getHours();
  const minutes = gmtPlus7.getMinutes();
  const isAfter0806 = hours > 8 || (hours === 8 && minutes >= 6);
  return isAfter0806 ? getNextWorkingDay(gmtPlus7) : gmtPlus7;
};

/**
 * Calculates the default end date for custom filters, which is the next working day.
 * @returns The default end date as a Date object.
 */
export const getDefaultEndDate = (): Date => {
  const gmtPlus7 = getGMTPlus7Date();
  const tomorrow = new Date(gmtPlus7);
  tomorrow.setDate(gmtPlus7.getDate() + 1);
  if (tomorrow.getDay() === 6) tomorrow.setDate(tomorrow.getDate() + 2); // If tomorrow is Saturday, set to Monday
  else if (tomorrow.getDay() === 0) tomorrow.setDate(tomorrow.getDate() + 1); // If tomorrow is Sunday, set to Monday
  return tomorrow;
};