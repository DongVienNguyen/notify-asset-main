
export const getNextMonday = (date: Date): Date => {
  const nextMonday = new Date(date);
  nextMonday.setDate(date.getDate() + (8 - date.getDay()));
  return nextMonday;
};

export const getDefaultPartsDay = (department: string, hours: number): string => {
  if (department === 'QLN') return 'Sáng';
  if (['CMT8', 'NS', 'ĐS', 'LĐH'].includes(department)) {
    return hours >= 8 ? 'Chiều' : 'Sáng';
  }
  return 'Sáng';
};

export const calculateDefaultValues = (currentUser: any) => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const hours = now.getHours();
  
  let defaultDate = new Date();
  
  // Weekend logic
  if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
    defaultDate = getNextMonday(now);
  } else if (dayOfWeek === 5 && hours >= 13) { // Friday after 1 PM
    defaultDate = getNextMonday(now);
  } else if (hours >= 13) { // After 1 PM on weekdays
    defaultDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Next day
  }

  const defaultPartsDay = getDefaultPartsDay(currentUser.department, hours);
  
  return {
    transaction_date: defaultDate.toISOString().split('T')[0],
    parts_day: defaultPartsDay
  };
};
