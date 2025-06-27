
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image, mimeType } = await req.json()

    if (!image) {
      throw new Error('Không có hình ảnh để phân tích')
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    if (!GEMINI_API_KEY) {
      throw new Error('Chưa cấu hình API key cho Gemini')
    }

    // Call Gemini Vision API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: `Phân tích hình ảnh này và trích xuất TẤT CẢ các chuỗi số có thể thấy.

Hãy tìm tất cả các chuỗi số dài từ 12-15 ký tự và liệt kê chúng ra.

Chỉ cần trả về các chuỗi số mà bạn nhìn thấy trong hình, không cần phân tích gì khác.

Trả về định dạng JSON thuần túy như sau:
{
  "foundNumbers": ["042410227010495", "042410217010256", "...]
}`
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: image
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1000,
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Gemini API error:', errorData)
      throw new Error('Lỗi khi gọi Gemini API')
    }

    const result = await response.json()
    console.log('Gemini response:', result)

    if (result.candidates && result.candidates[0] && result.candidates[0].content) {
      const content = result.candidates[0].content.parts[0].text
      console.log('Generated content:', content)
      
      let foundNumbers = []
      
      try {
        // Thử parse JSON từ response
        const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim()
        const parsedResult = JSON.parse(cleanContent)
        foundNumbers = parsedResult.foundNumbers || []
      } catch (parseError) {
        console.log('Could not parse JSON, using regex fallback')
        // Fallback: tìm trực tiếp từ nội dung text
        const numberMatches = content.match(/\d{12,15}/g) || []
        foundNumbers = numberMatches
      }

      console.log('Found numbers from Gemini:', foundNumbers)

      // Áp dụng logic phân tích theo yêu cầu
      const regex = /(0424\d+|0423\d+)/g
      let detectedRoom = null
      let assetCodes = []

      // Tìm tất cả các chuỗi khớp với regex
      const allMatches = []
      for (const number of foundNumbers) {
        const matches = number.match(regex)
        if (matches) {
          allMatches.push(...matches)
        }
      }

      console.log('Matched sequences:', allMatches)

      // Lặp qua từng chuỗi số tìm được
      for (const match of allMatches) {
        console.log('Processing match:', match)
        
        // Phân tích Phòng ban (chỉ thực hiện nếu detectedRoom chưa được tìm thấy)
        if (!detectedRoom) {
          if (match.startsWith('0424201')) {
            detectedRoom = 'CMT8'
          } else if (match.startsWith('0424202')) {
            detectedRoom = 'NS'
          } else if (match.startsWith('0424203')) {
            detectedRoom = 'ĐS'
          } else if (match.startsWith('0424204')) {
            detectedRoom = 'LĐH'
          } else if (match.startsWith('042300')) {
            detectedRoom = 'DVKH'
          } else if (match.startsWith('042410')) {
            detectedRoom = 'QLN'
          }
        }

        // Phân tích Mã & Năm TS với logic chính xác
        if (match.length >= 12) {
          // Lấy 2 ký tự, là ký tự thứ 9 và thứ 10 tính từ cuối chuỗi
          const year = match.slice(-10, -8)
          
          // Lấy 4 ký tự cuối và chuyển thành số
          const code = parseInt(match.slice(-4), 10)
          
          console.log(`Match: ${match}, Year: ${year}, Code: ${code}`)
          
          // Kiểm tra year và code hợp lệ
          if (year && year.length === 2 && !isNaN(code) && code > 0) {
            const assetCode = `${code}.${year}`
            assetCodes.push(assetCode)
            console.log(`Created asset code: ${assetCode}`)
          }
        }
      }

      // Loại bỏ các mã tài sản trùng lặp
      assetCodes = [...new Set(assetCodes)]
      
      console.log('Final result:', { assetCodes, detectedRoom })

      return new Response(
        JSON.stringify({
          assetCodes: assetCodes,
          detectedRoom: detectedRoom,
          foundCount: assetCodes.length,
          confidence: assetCodes.length > 0 ? 0.9 : 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    throw new Error('Không nhận được phản hồi hợp lệ từ Gemini')

  } catch (error) {
    console.error('Error in analyze-asset-image:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        foundCount: 0,
        assetCodes: [],
        detectedRoom: null,
        confidence: 0 
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
