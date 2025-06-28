
import { testEmailFunction } from '@/services/emailService';

export const performEmailTest = async (username: string) => {
  console.log('=== TEST EMAIL FUNCTION START ===');
  console.log('Username:', username);
  
  if (!username) {
    throw new Error('Không tìm thấy thông tin người dùng');
  }

  console.log('📧 Calling testEmailFunction with username:', username);
  const result = await testEmailFunction(username);
  console.log('📧 Test email result:', result);
  console.log('=== TEST EMAIL FUNCTION END ===');
  
  return result;
};
