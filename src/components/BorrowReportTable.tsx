import React, { Dispatch, SetStateAction } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types/asset';

export interface BorrowReportTableProps { // Exported interface
  transactions: Transaction[];
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>; // Corrected type
  totalPages: number;
  ITEMS_PER_PAGE: number;
  totalRecords: number;
}

const BorrowReportTable: React.FC<BorrowReportTableProps> = ({
  transactions,
  currentPage,
  setCurrentPage,
  totalPages,
  ITEMS_PER_PAGE,
  totalRecords,
}) => {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã NV</TableHead>
              <TableHead>Ngày GD</TableHead>
              <TableHead>Ca</TableHead>
              <TableHead>Phòng</TableHead>
              <TableHead>Loại GD</TableHead>
              <TableHead>Năm TS</TableHead>
              <TableHead>Mã TS</TableHead>
              <TableHead>Ghi chú</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.staff_code}</TableCell>
                  <TableCell>{transaction.transaction_date}</TableCell>
                  <TableCell>{transaction.parts_day}</TableCell>
                  <TableCell>{transaction.room}</TableCell>
                  <TableCell>{transaction.transaction_type}</TableCell>
                  <TableCell>{transaction.asset_year}</TableCell>
                  <TableCell>{transaction.asset_code}</TableCell>
                  <TableCell>{transaction.note}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Không có dữ liệu giao dịch.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center">
        <Button
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          Trước
        </Button>
        <span>
          Trang {currentPage} / {totalPages} (Tổng: {totalRecords} bản ghi)
        </span>
        <Button
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Tiếp
        </Button>
      </div>
    </div>
  );
};

export default BorrowReportTable;