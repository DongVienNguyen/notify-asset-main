import { testEmailFunction } from './notifications/assetNotificationService';

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

export const sendTestEmail = async () => {
  // Trong một ứng dụng thực tế, bạn sẽ lấy username từ phiên đăng nhập hiện tại
  // hoặc một nguồn cấu hình. Ví dụ dưới đây sử dụng một giá trị mặc định.
  const testUsername = 'testuser@example.com'; // Thay thế bằng email người dùng thực tế hoặc email test cấu hình
  return await testEmailFunction(testUsername);
};