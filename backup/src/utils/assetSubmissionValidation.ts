
import { validateAllAssets } from '@/utils/assetValidation';

export const validateAssetSubmission = (
  multipleAssets: string[],
  isRestrictedTime: boolean
) => {
  if (isRestrictedTime) {
    return {
      isValid: false,
      error: 'Không thể gửi trong khung giờ 7:45-8:05 và 12:45-13:05'
    };
  }
  
  return validateAllAssets(multipleAssets);
};
