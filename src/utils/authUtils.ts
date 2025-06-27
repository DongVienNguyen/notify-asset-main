
import { Staff } from '@/types/auth';

export const getStoredUser = (): Staff | null => {
  const loggedInStaff = localStorage.getItem('loggedInStaff');
  if (loggedInStaff) {
    try {
      return JSON.parse(loggedInStaff);
    } catch (error) {
      console.error('Error parsing logged in staff:', error);
      localStorage.removeItem('loggedInStaff');
      return null;
    }
  }
  return null;
};

export const storeUser = (user: Staff): void => {
  localStorage.setItem('loggedInStaff', JSON.stringify(user));
};

export const removeStoredUser = (): void => {
  localStorage.removeItem('loggedInStaff');
};

export const createStaffUser = (staff: any): Staff => {
  return {
    id: staff.id,
    username: staff.username,
    staff_name: staff.staff_name,
    role: staff.role as 'admin' | 'user',
    department: staff.department,
    account_status: staff.account_status as 'active' | 'locked'
  };
};
