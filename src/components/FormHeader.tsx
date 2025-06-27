
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const FormHeader = () => {
  return (
    <>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Thông báo Mượn/Xuất</h1>
        <p className="text-gray-600 mt-2">
          Khung giờ <span className="font-semibold">7:45-8:05</span> và <span className="font-semibold">12:45-13:05</span> hãy nhắn Zalo vì đã chốt DS
        </p>
      </div>

      {/* Instructions */}
      <Card id="instruction-section" className="border-green-200 bg-gradient-to-r from-slate-50 to-green-50">
        <CardContent className="p-4">
          <p>
            Từ <strong>Phải</strong> sang <strong>Trái</strong>: 2 ký tự từ thứ <strong>9</strong> và <strong>10</strong> là <strong>Năm TS</strong>: 24, 4 ký tự cuối là <strong>Mã TS</strong>: 259 - vd: 042410<strong>24</strong>7020<strong>0259</strong> → 259.24
          </p>
        </CardContent>
      </Card>
    </>
  );
};

export default FormHeader;
