import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface GroupedRow {
  room: string;
  year: string;
  codes: string;
}

interface GroupedReportViewProps {
  groupedRows: GroupedRow[];
  filterDisplayText: string;
}

const GroupedReportView: React.FC<GroupedReportViewProps> = ({ groupedRows, filterDisplayText }) => {
  return (
    <Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <CardHeader>
        <CardTitle>{filterDisplayText}</CardTitle>
        <p className="text-sm text-gray-600">Dấu (*) đánh dấu tài sản đã xuất/mượn nhiều lần trong tuần</p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Phòng</TableHead>
              <TableHead>Năm</TableHead>
              <TableHead>Mã TS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedRows.length > 0 ? (
              groupedRows.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{row.room}</TableCell>
                  <TableCell>{row.year}</TableCell>
                  <TableCell>{row.codes}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-gray-500">Không có dữ liệu</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default GroupedReportView;