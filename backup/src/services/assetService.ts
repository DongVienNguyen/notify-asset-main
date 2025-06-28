
import { supabase } from '@/integrations/supabase/client';
import { validateInput } from '@/utils/inputValidation';
import { logSecurityEvent } from '@/utils/secureAuthUtils';

export interface AssetTransaction {
  staff_code: string;
  transaction_date: string;
  parts_day: string;
  room: string;
  transaction_type: string;
  asset_year: number;
  asset_code: number;
  note?: string;
}

export const saveAssetTransactions = async (transactions: AssetTransaction[]) => {
  try {
    // Validate all transactions before saving
    for (const transaction of transactions) {
      if (!validateInput.isValidAssetCode(transaction.asset_code)) {
        throw new Error('Mã tài sản không hợp lệ');
      }
      
      if (!validateInput.isValidYear(transaction.asset_year)) {
        throw new Error('Năm tài sản không hợp lệ');
      }
      
      if (!validateInput.isValidDate(transaction.transaction_date)) {
        throw new Error('Ngày giao dịch không hợp lệ');
      }
      
      // Sanitize text fields
      transaction.staff_code = validateInput.sanitizeString(transaction.staff_code);
      transaction.parts_day = validateInput.sanitizeString(transaction.parts_day);
      transaction.room = validateInput.sanitizeString(transaction.room);
      transaction.transaction_type = validateInput.sanitizeString(transaction.transaction_type);
      if (transaction.note) {
        transaction.note = validateInput.sanitizeString(transaction.note);
      }
    }
    
    const { data, error } = await supabase
      .from('asset_transactions')
      .insert(transactions)
      .select();

    if (error) {
      logSecurityEvent('ASSET_TRANSACTION_SAVE_ERROR', { error: error.message });
      throw new Error(`Lỗi lưu dữ liệu: ${error.message}`);
    }

    return data;
  } catch (error) {
    logSecurityEvent('ASSET_TRANSACTION_SAVE_EXCEPTION', { error: (error as Error).message });
    throw error;
  }
};

export const getAssetTransactions = async (staffCode?: string) => {
  try {
    let query = supabase
      .from('asset_transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (staffCode) {
      // Validate staff code
      if (!validateInput.isValidUsername(staffCode)) {
        throw new Error('Mã nhân viên không hợp lệ');
      }
      query = query.eq('staff_code', validateInput.sanitizeString(staffCode));
    }

    const { data, error } = await query;

    if (error) {
      logSecurityEvent('ASSET_TRANSACTION_FETCH_ERROR', { error: error.message });
      throw error;
    }

    return data;
  } catch (error) {
    logSecurityEvent('ASSET_TRANSACTION_FETCH_EXCEPTION', { error: (error as Error).message });
    throw error;
  }
};
