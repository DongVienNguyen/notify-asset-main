
import React from 'react';
import { BarChart3 } from 'lucide-react';

const BorrowReportHeader = React.memo(() => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
          <BarChart3 className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo tài sản đã mượn</h1>
          <p className="text-gray-600">TS cần cắt bìa kiểm tra hàng quý</p>
        </div>
      </div>
    </div>
  );
});

BorrowReportHeader.displayName = 'BorrowReportHeader';

export default BorrowReportHeader;
