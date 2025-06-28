import { supabase } from '@/integrations/supabase/client';
import { validateInput } from '@/utils/inputValidation';
import { logSecurityEvent } from '@/utils/secureAuthUtils';
import { AssetTransactionPayload } from '@/types/asset'; // Import the new interface

export interface AssetTransactionFilters {
  staffCode?: string;
  startDate?: string;
  endDate?: string;
  parts_day?: 'Sáng' | 'Chiều' | 'all';
  isQlnPgdNextDay?: boolean;
}

export const saveAssetTransactions = async (transactions: AssetTransactionPayload[]) => { // Use AssetTransactionPayload
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

export const getAssetTransactions = async (filters: AssetTransactionFilters = {}) => {
  try {
    let query = supabase.from('asset_transactions').select('*');

    if (filters.staffCode) {
      if (!validateInput.isValidUsername(filters.staffCode)) {
        throw new Error('Mã nhân viên không hợp lệ');
      }
      query = query.eq('staff_code', validateInput.sanitizeString(filters.staffCode));
    }

    if (filters.startDate) {
      query = query.gte('transaction_date', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('transaction_date', filters.endDate);
    }

    if (filters.isQlnPgdNextDay && filters.startDate) {
      const pgdRooms = ['CMT8', 'NS', 'ĐS', 'LĐH'].map(r => `'${r}'`).join(',');
      query = query
        .eq('transaction_date', filters.startDate)
        .or(`parts_day.eq.Sáng,and(parts_day.eq.Chiều,room.in.(${pgdRooms}))`);
    } else if (filters.parts_day && filters.parts_day !== 'all') {
      query = query.eq('parts_day', filters.parts_day);
    }

    // Add sorting at the end
    query = query.order('room', { ascending: true })
                 .order('asset_year', { ascending: true })
                 .order('asset_code', { ascending: true });

    const { data, error } = await query;

    if (error) {
      logSecurityEvent('ASSET_TRANSACTION_FETCH_ERROR', { error: error.message });
      throw error;
    }

    return data || [];
  } catch (error) {
    logSecurityEvent('ASSET_TRANSACTION_FETCH_EXCEPTION', { error: (error as Error).message });
    throw error;
  }
};