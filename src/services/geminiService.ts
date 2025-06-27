
import { supabase } from '@/integrations/supabase/client';

export interface GeminiAnalysisResult {
  foundCount: number;
  assetCodes: string[];
  detectedRoom?: string;
  confidence: number;
}

export const analyzeImageWithGemini = async (imageFile: File): Promise<GeminiAnalysisResult> => {
  try {
    console.log('Starting image analysis with Gemini for file:', imageFile.name);
    
    // Convert image to base64
    const base64Image = await convertFileToBase64(imageFile);
    console.log('Image converted to base64, size:', base64Image.length);
    
    const response = await supabase.functions.invoke('analyze-asset-image', {
      body: {
        image: base64Image,
        mimeType: imageFile.type
      }
    });

    console.log('Supabase function response:', response);

    if (response.error) {
      console.error('Gemini API error:', response.error);
      throw new Error('Lỗi khi phân tích hình ảnh: ' + response.error.message);
    }

    if (!response.data) {
      throw new Error('Không nhận được dữ liệu từ API');
    }

    console.log('Analysis result:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw new Error('Không thể phân tích hình ảnh. Vui lòng thử lại.');
  }
};

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:image/jpeg;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

