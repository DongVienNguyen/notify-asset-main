import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatToDDMMYYYY } from '@/utils/dateUtils';

interface Transaction {
  id: string;
  staff_code: string;
  transaction_date: string;
  parts_day: string;
  room: string;
  transaction_type: string;
  asset_year: number;
  asset_code: number;
  note: string;
}

interface BorrowReportTableProps {
  transactions: Transaction[];
}

const BorrowReportTable: React.FC<BorrowReportTableProps> = ({ transactions }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Phòng</TableHead>
          <TableHead>Năm TS</TableHead>
          <TableHead>Mã TS</TableHead>
          <TableHead>Ngày mượn</TableHead>
          <TableHead>Buổi</TableHead>
          <TableHead>CB mượn</TableHead>
          <TableHead>Ghi chú</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">{transaction.room}</TableCell>
              <TableCell>{transaction.asset_year}</TableCell>
              <TableCell>{transaction.asset_code}</TableCell>
              <TableCell>{formatToDDMMYYYY(transaction.transaction_date)}</TableCell>
              <TableCell>{transaction.parts_day}</TableCell>
              <TableCell>{transaction.staff_code}</TableCell>
              <TableCell>{transaction.note}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-gray-500">
              Không có dữ liệu
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default BorrowReportTable;