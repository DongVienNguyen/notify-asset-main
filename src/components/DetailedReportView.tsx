import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatToDDMMYYYY } from '@/utils/dateUtils';
import { Transaction } from '@/types/asset'; // Import the new interface

interface DetailedReportViewProps {
  transactions: Transaction[];
  paginatedTransactions: Transaction[];
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  filterDisplayText: string;
}

const DetailedReportView: React.FC<DetailedReportViewProps> = ({
  transactions,
  paginatedTransactions,
  totalPages,
  currentPage,
  setCurrentPage,
  filterDisplayText,
}) => {
  return (
    <Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <CardHeader>
        <CardTitle>Danh sách tài sản cần lấy ({transactions.length} bản ghi)</CardTitle>
        <p className="text-sm text-gray-600">{filterDisplayText}</p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Phòng</TableHead>
              <TableHead>Năm TS</TableHead>
              <TableHead>Mã TS</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Ngày</TableHead>
              <TableHead>Buổi</TableHead>
              <TableHead>Ghi chú</TableHead>
              <TableHead>CB</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.room}</TableCell>
                  <TableCell>{transaction.asset_year}</TableCell>
                  <TableCell>{transaction.asset_code}</TableCell>
                  <TableCell>{transaction.transaction_type}</TableCell>
                  <TableCell>{formatToDDMMYYYY(transaction.transaction_date)}</TableCell>
                  <TableCell>{transaction.parts_day}</TableCell>
                  <TableCell>{transaction.note}</TableCell>
                  <TableCell>{transaction.staff_code}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500">Không có dữ liệu</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <Button variant="outline" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>Trước</Button>
            <span className="text-sm text-gray-600">Trang {currentPage} trên {totalPages}</span>
            <Button variant="outline" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>Tiếp</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DetailedReportView;