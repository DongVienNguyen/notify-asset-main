import { Staff } from '@/types/auth';

/**
 * Checks if the user is an Admin.
 */
export const isAdmin = (user: Staff): boolean => {
  return user.role === 'admin';
};

/**
 * Checks if the user is from the NQ department or is an Admin.
 * These users have access to reminder, reporting, and other asset pages.
 */
export const isNqOrAdmin = (user: Staff): boolean => {
  return user.role === 'admin' || user.department === 'NQ';
};