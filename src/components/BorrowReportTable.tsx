
import React, { useCallback, useMemo } from 'react';
import { Download, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AssetTransaction {
  id: string;
  staff_code: string;
  transaction_date: string;
  parts_day: string;
  room: string;
  transaction_type: string;
  asset_year: number;
  asset_code: number;
  note: string;
  created_at?: string;
}

interface BorrowReportTableProps {
  filteredTransactions: AssetTransaction[];
  paginatedTransactions: AssetTransaction[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  ITEMS_PER_PAGE: number;
}

const BorrowReportTable = React.memo(({ 
  filteredTransactions, 
  paginatedTransactions, 
  currentPage, 
  setCurrentPage, 
  totalPages, 
  ITEMS_PER_PAGE 
}: BorrowReportTableProps) => {
  
  const formatDate = useCallback((date: string) => {
    return new Date(date).toLocaleDateString('vi-VN');
  }, []);

  const exportToPDF = useCallback(() => {
    setTimeout(() => {
      window.print();
    }, 500);
  }, []);

  const exportToExcel = useCallback(() => {
    const headers = ['STT', 'Phòng', 'Năm TS', 'Mã TS', 'Loại', 'Ngày', 'CB'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map((transaction, index) => [
        index + 1,
        transaction.room,
        transaction.asset_year,
        transaction.asset_code,
        transaction.transaction_type,
        formatDate(transaction.transaction_date),
        transaction.staff_code
      ].join(','))
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `bao-cao-ts-da-muon-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [filteredTransactions, formatDate]);

  const handlePrevPage = useCallback(() => {
    setCurrentPage(Math.max(1, currentPage - 1));
  }, [currentPage, setCurrentPage]);

  const handleNextPage = useCallback(() => {
    setCurrentPage(Math.min(totalPages, currentPage + 1));
  }, [currentPage, totalPages, setCurrentPage]);

  const tableRows = useMemo(() => {
    return paginatedTransactions.map((transaction, index) => (
      <TableRow key={transaction.id}>
        <TableCell>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
        <TableCell className="font-medium">{transaction.room}</TableCell>
        <TableCell>{transaction.asset_year}</TableCell>
        <TableCell>{transaction.asset_code}</TableCell>
        <TableCell>{transaction.transaction_type}</TableCell>
        <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
        <TableCell>{transaction.staff_code}</TableCell>
      </TableRow>
    ));
  }, [paginatedTransactions, currentPage, ITEMS_PER_PAGE, formatDate]);

  return (
    <div id="print-section">
      <Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Danh sách tài sản đã mượn ({filteredTransactions.length} bản ghi)
            </CardTitle>
            
            <div className="flex space-x-4">
              <Button 
                variant="outline"
                onClick={exportToExcel}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                <FileUp className="w-4 h-4 mr-2" />
                Xuất Excel
              </Button>
              <Button 
                onClick={exportToPDF}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Xuất PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>STT</TableHead>
                <TableHead>Phòng</TableHead>
                <TableHead>Năm TS</TableHead>
                <TableHead>Mã TS</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead>CB</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.length > 0 ? (
                tableRows
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              
              <span className="text-sm text-gray-600">
                Trang {currentPage} trên {totalPages}
              </span>
              
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Tiếp
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

BorrowReportTable.displayName = 'BorrowReportTable';

export default BorrowReportTable;
