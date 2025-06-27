
// Helper function to parse date and compare with current date
export const parseDateString = (dateStr: string) => {
  // dateStr format: "dd-MM"
  const [day, month] = dateStr.split('-').map(num => parseInt(num, 10));
  const currentYear = new Date().getFullYear();
  return new Date(currentYear, month - 1, day); // month is 0-indexed
};

export const isDateDueOrOverdue = (dateStr: string) => {
  try {
    const dueDate = parseDateString(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    dueDate.setHours(0, 0, 0, 0); // Reset time to start of day
    
    return dueDate <= today;
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
    return false;
  }
};
