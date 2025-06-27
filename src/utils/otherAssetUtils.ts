
import { supabase } from '@/integrations/supabase/client';
import { validateInput } from '@/utils/inputValidation';
import { logSecurityEvent } from '@/utils/secureAuthUtils';

export const setCurrentUserContext = async (user: any) => {
  if (!user?.username) {
    logSecurityEvent('INVALID_USER_CONTEXT_ATTEMPT', { user: user?.username });
    return false;
  }

  // Validate username before setting context
  if (!validateInput.isValidUsername(user.username)) {
    logSecurityEvent('INVALID_USERNAME_IN_CONTEXT', { username: user.username });
    return false;
  }

  try {
    const promises = [
      supabase.rpc('set_config', {
        setting_name: 'app.current_user',
        new_value: validateInput.sanitizeString(user.username),
        is_local: false
      }),
      supabase.rpc('set_config', {
        setting_name: 'app.current_user',
        new_value: validateInput.sanitizeString(user.username),
        is_local: true
      })
    ];
    
    const results = await Promise.allSettled(promises);
    const hasErrors = results.some(result => result.status === 'rejected');
    
    if (hasErrors) {
      logSecurityEvent('USER_CONTEXT_SET_ERROR', { username: user.username });
      return false;
    }
    
    return true;
  } catch (error) {
    logSecurityEvent('USER_CONTEXT_SET_EXCEPTION', { 
      username: user.username, 
      error: (error as Error).message 
    });
    return false;
  }
};

export const createNotesWithTimestamp = (notes: string, isEditing: boolean) => {
  // Validate and sanitize notes input
  const sanitizedNotes = validateInput.sanitizeString(notes);
  const timestamp = new Date().toLocaleString('vi-VN');
  const actionText = isEditing ? 'Cập nhật' : 'Tạo';
  
  return sanitizedNotes ? 
    `${sanitizedNotes} [${actionText} lúc ${timestamp}]` : 
    `[${actionText} lúc ${timestamp}]`;
};
