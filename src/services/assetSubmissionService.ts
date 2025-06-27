
import { saveAssetTransactions, AssetTransaction } from '@/services/assetService';
import { sendAssetTransactionConfirmation } from '@/services/emailService';
import { FormData } from '@/types/assetSubmission';

export const submitAssetTransactions = async (
  formData: FormData,
  multipleAssets: string[],
  username: string
) => {
  console.log('=== ASSET ENTRY SUBMIT START ===');
  console.log('Current user:', username);
  
  const transactions: AssetTransaction[] = multipleAssets.map(asset => {
    const [code, year] = asset.split('.');
    return {
      staff_code: username,
      transaction_date: formData.transaction_date,
      parts_day: formData.parts_day,
      room: formData.room,
      transaction_type: formData.transaction_type,
      asset_year: parseInt(year),
      asset_code: parseInt(code),
      note: formData.note || null
    };
  });
  
  console.log('Submitting transactions:', transactions);
  
  // Save to database first
  const savedTransactions = await saveAssetTransactions(transactions);
  console.log('Successfully saved to database:', savedTransactions);
  
  // Send email notification after successful save
  console.log('=== SENDING EMAIL NOTIFICATION ===');
  const emailResult = await sendAssetTransactionConfirmation(
    username,
    savedTransactions[0], // Pass the first transaction as sample data
    true // isSuccess = true since we successfully saved to database
  );
  console.log('Email notification result:', emailResult);
  
  console.log('=== ASSET ENTRY SUBMIT END ===');
  
  return { savedTransactions, emailResult };
};
