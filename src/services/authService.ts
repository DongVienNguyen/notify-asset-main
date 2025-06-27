
import { supabase } from '@/integrations/supabase/client';
import { Staff, LoginResult } from '@/types/auth';
import bcrypt from 'bcryptjs';

export const checkStaffExists = async (): Promise<boolean> => {
  const { count, error: countError } = await supabase
    .from('staff')
    .select('*', { count: 'exact', head: true });
  
  console.log('Staff count check:', { count, countError });
  
  if (countError) {
    console.error('Error checking staff count:', countError);
    return false;
  }

  return count !== null && count > 0;
};

export const getStaffByUsername = async (username: string) => {
  console.log('🔍 Looking for staff with username:', username);
  
  try {
    // First, let's check if we can connect to the database at all
    const { data: testData, error: testError } = await supabase
      .from('staff')
      .select('count')
      .limit(1);
    
    console.log('📊 Database connection test:', { testData, testError });
    
    // Now try the actual query with multiple approaches
    console.log('🔍 Attempting exact match query...');
    const { data: exactMatch, error: exactError } = await supabase
      .from('staff')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    console.log('📊 Exact match result:', { exactMatch, exactError });

    if (exactMatch) {
      console.log('✅ Found staff with exact match');
      return { staff: exactMatch, error: null };
    }

    // Try case-insensitive search
    console.log('🔍 Attempting case-insensitive query...');
    const { data: caseInsensitive, error: caseError } = await supabase
      .from('staff')
      .select('*')
      .ilike('username', username)
      .maybeSingle();

    console.log('📊 Case-insensitive result:', { caseInsensitive, caseError });

    if (caseInsensitive) {
      console.log('✅ Found staff with case-insensitive match');
      return { staff: caseInsensitive, error: null };
    }

    // Let's also try to get all staff to see what's in the database
    console.log('🔍 Checking all staff in database...');
    const { data: allStaff, error: allError } = await supabase
      .from('staff')
      .select('username, staff_name, account_status')
      .limit(10);

    console.log('📊 All staff in database:', { allStaff, allError });

    if (exactError || caseError) {
      console.error('❌ Database query errors:', { exactError, caseError });
      return { staff: null, error: 'Lỗi kết nối cơ sở dữ liệu' };
    }

    console.log('❌ No staff found with username:', username);
    return { staff: null, error: null };

  } catch (error) {
    console.error('💥 Exception in getStaffByUsername:', error);
    return { staff: null, error: 'Lỗi hệ thống' };
  }
};

export const handleFailedLogin = async (username: string, currentAttempts: number = 0): Promise<LoginResult> => {
  const newAttempts = currentAttempts + 1;
  
  if (newAttempts >= 3) {
    // Lock account - use case-insensitive update
    const { error } = await supabase
      .from('staff')
      .update({
        account_status: 'locked',
        failed_login_attempts: newAttempts,
        last_failed_login: new Date().toISOString(),
        locked_at: new Date().toISOString()
      })
      .ilike('username', username);
    
    if (error) {
      console.error('Error locking account:', error);
    }
    
    return { error: 'Tài khoản đã bị khóa do nhập sai mật khẩu quá nhiều lần' };
  } else {
    // Update failed attempts - use case-insensitive update
    const { error } = await supabase
      .from('staff')
      .update({
        failed_login_attempts: newAttempts,
        last_failed_login: new Date().toISOString()
      })
      .ilike('username', username);
    
    if (error) {
      console.error('Error updating failed attempts:', error);
    }
    
    const remainingAttempts = 3 - newAttempts;
    return { error: `Mật khẩu không đúng. Còn ${remainingAttempts} lần thử...` };
  }
};

export const resetFailedLoginAttempts = async (username: string): Promise<void> => {
  // Use case-insensitive update
  const { error } = await supabase
    .from('staff')
    .update({
      failed_login_attempts: 0,
      last_failed_login: null
    })
    .ilike('username', username);
  
  if (error) {
    console.error('Error resetting failed attempts:', error);
  }
};

export const validatePassword = async (password: string, storedPassword: string): Promise<boolean> => {
  console.log('🔑 Validating password with bcrypt');
  console.log('🔑 Stored password hash starts with:', storedPassword?.substring(0, 10));
  
  try {
    // Sử dụng bcrypt để so sánh password
    const isValid = await bcrypt.compare(password, storedPassword);
    console.log('🔑 Password validation result:', { isValid });
    return isValid;
  } catch (error) {
    console.error('❌ Error validating password:', error);
    return false;
  }
};
