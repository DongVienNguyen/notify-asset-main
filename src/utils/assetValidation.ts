/**
 * Validates an array of asset strings.
 * Each asset must be in the format "CODE.YEAR".
 * CODE: 1-4 digits.
 * YEAR: 2 digits, value between 21 and 99.
 * @param assets Array of asset strings.
 * @returns An object with `isValid` (boolean) and `error` (string | null).
 */
export const validateAllAssets = (assets: string[]): { isValid: boolean; error: string | null } => {
  for (const asset of assets) {
    const trimmedAsset = asset.trim();
    if (!trimmedAsset) {
      return { isValid: false, error: 'Mã tài sản không được để trống' };
    }

    if (!trimmedAsset.includes('.')) {
      return { isValid: false, error: `Mã "${trimmedAsset}" không hợp lệ. Phải có dấu chấm.` };
    }

    const parts = trimmedAsset.split('.');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      return { isValid: false, error: `Mã "${trimmedAsset}" không hợp lệ. Phải có dạng [Mã TS].[Năm TS].` };
    }

    const [assetCode, assetYear] = parts;

    if (!/^\d+$/.test(assetCode) || !/^\d+$/.test(assetYear)) {
      return { isValid: false, error: `Mã "${trimmedAsset}" phải là số.` };
    }

    if (assetCode.length > 4) {
      return { isValid: false, error: `Mã TS trong "${trimmedAsset}" không được dài hơn 4 ký tự.` };
    }

    if (assetYear.length !== 2) {
      return { isValid: false, error: `Năm TS trong "${trimmedAsset}" phải có đúng 2 ký tự.` };
    }

    const yearNum = parseInt(assetYear, 10);
    if (yearNum < 21 || yearNum > 99) {
      return { isValid: false, error: `Năm TS trong "${trimmedAsset}" phải từ 21 đến 99.` };
    }
  }

  return { isValid: true, error: null };
};