
export const validateAssetFormat = (value: string): boolean => {
  const regex = /^\d{1,4}\.\d{2}$/;
  return regex.test(value);
};

export const validateAllAssets = (multipleAssets: string[]): { isValid: boolean; error?: string } => {
  for (const asset of multipleAssets) {
    if (!asset.trim()) {
      return { isValid: false, error: 'Vui lòng điền đầy đủ tất cả các mã tài sản' };
    }
    
    if (!validateAssetFormat(asset)) {
      return { isValid: false, error: `Mã tài sản "${asset}" không đúng định dạng. Vui lòng nhập theo format: Mã.Năm (ví dụ: 259.24)` };
    }
    
    const parts = asset.split('.');
    const year = parseInt(parts[1]);
    if (year < 20 || year > 99) {
      return { isValid: false, error: `Năm tài sản "${asset}" phải từ 20-99` };
    }
  }
  return { isValid: true };
};
