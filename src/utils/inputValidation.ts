
export const validateInput = {
  // Sanitize string input to prevent XSS
  sanitizeString: (input: string): string => {
    if (typeof input !== 'string') return '';
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .slice(0, 1000); // Limit length
  },

  // Validate email format
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  },

  // Validate username (alphanumeric and underscore only)
  isValidUsername: (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    return usernameRegex.test(username);
  },

  // Validate date format
  isValidDate: (dateString: string): boolean => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  },

  // Validate asset code (numbers only)
  isValidAssetCode: (code: string | number): boolean => {
    const numCode = typeof code === 'string' ? parseInt(code) : code;
    return !isNaN(numCode) && numCode > 0 && numCode <= 999999;
  },

  // Validate year (updated to handle 2-digit years from 20-99)
  isValidYear: (year: string | number): boolean => {
    const numYear = typeof year === 'string' ? parseInt(year) : year;
    // Accept 2-digit years from 20-99 (representing 2020-2099)
    return !isNaN(numYear) && numYear >= 20 && numYear <= 99;
  },

  // General text validation with length limits
  validateText: (text: string, maxLength: number = 500): { isValid: boolean; error?: string } => {
    if (!text || typeof text !== 'string') {
      return { isValid: false, error: 'Văn bản không được để trống' };
    }
    
    const sanitized = text.trim();
    if (sanitized.length === 0) {
      return { isValid: false, error: 'Văn bản không được để trống' };
    }
    
    if (sanitized.length > maxLength) {
      return { isValid: false, error: `Văn bản không được vượt quá ${maxLength} ký tự` };
    }
    
    return { isValid: true };
  }
};
