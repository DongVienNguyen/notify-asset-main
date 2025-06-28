import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatToDDMMYYYY } from '@/utils/dateUtils';

const OtherAssetTable = ({ filteredAssets, user, onEdit, onDelete }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tên tài sản / thùng</TableHead>
          <TableHead>Ngày gửi</TableHead>
          <TableHead>Người gửi</TableHead>
          <TableHead>Người nhận (gửi)</TableHead>
          <TableHead>Ngày xuất</TableHead>
          <TableHead>Người giao (xuất)</TableHead>
          <TableHead>Người nhận (xuất)</TableHead>
          <TableHead>Ghi chú</TableHead>
          <TableHead>Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredAssets.length > 0 ? (
          filteredAssets.map((asset) => (
            <TableRow key={asset.id}>
              <TableCell className="font-medium">{asset.name}</TableCell>
              <TableCell>{formatToDDMMYYYY(asset.deposit_date)}</TableCell>
              <TableCell>{asset.depositor}</TableCell>
              <TableCell>{asset.deposit_receiver}</TableCell>
              <TableCell>{formatToDDMMYYYY(asset.withdrawal_date)}</TableCell>
              <TableCell>{asset.withdrawal_deliverer}</TableCell>
              <TableCell>{asset.withdrawal_receiver}</TableCell>
              <TableCell>{asset.notes}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => onEdit(asset)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  {user?.role === 'admin' && (
                    <Button size="sm" variant="destructive" onClick={() => onDelete(asset)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={9} className="text-center text-gray-500">
              Không có dữ liệu
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default OtherAssetTable;