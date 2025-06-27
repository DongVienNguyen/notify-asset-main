
import { Staff } from '@/types/auth';

// Remove sensitive data from logs
export const sanitizeForLog = (data: any): any => {
  if (!data) return data;
  
  const sanitized = { ...data };
  
  // Remove sensitive fields
  if (sanitized.password) delete sanitized.password;
  if (sanitized.failed_login_attempts) delete sanitized.failed_login_attempts;
  if (sanitized.last_failed_login) delete sanitized.last_failed_login;
  if (sanitized.locked_at) delete sanitized.locked_at;
  
  return sanitized;
};

// Secure user data for client side
export const sanitizeUserForClient = (user: any): Staff | null => {
  if (!user) return null;
  
  return {
    id: user.id,
    username: user.username,
    staff_name: user.staff_name,
    role: user.role as 'admin' | 'user',
    department: user.department,
    account_status: user.account_status as 'active' | 'locked'
  };
};

// Rate limiting helper (simple implementation)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export const checkRateLimit = (identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean => {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier);
  
  if (!attempts) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Reset if outside window
  if (now - attempts.lastAttempt > windowMs) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }
  
  if (attempts.count >= maxAttempts) {
    return false;
  }
  
  attempts.count++;
  attempts.lastAttempt = now;
  return true;
};

// Security logging (without sensitive data)
export const logSecurityEvent = (event: string, details: any = {}) => {
  const sanitizedDetails = sanitizeForLog(details);
  console.log(`[SECURITY] ${event}:`, sanitizedDetails);
};
