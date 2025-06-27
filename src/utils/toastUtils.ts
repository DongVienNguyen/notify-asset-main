
import { useCallback } from 'react';

export const createToastUtils = (toast: any) => {
  return useCallback((title: string, description?: string, variant?: 'default' | 'destructive') => {
    console.log('=== TOAST DEBUG START ===');
    console.log('Toast params:', { title, description, variant });
    console.log('useToast hook available:', !!toast);
    
    try {
      toast({
        title,
        description,
        variant: variant || 'default'
      });
      console.log('✅ Toast called successfully');
    } catch (error) {
      console.error('❌ Toast error:', error);
      alert(`${title}${description ? '\n' + description : ''}`);
      console.log('Fallback alert shown');
    }
    console.log('=== TOAST DEBUG END ===');
  }, [toast]);
};
