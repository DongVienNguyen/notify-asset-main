
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface OtherAsset {
  id: string;
  name: string;
  deposit_date: string;
  depositor: string;
  deposit_receiver: string;
  withdrawal_date?: string;
  withdrawal_deliverer?: string;
  withdrawal_receiver?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface User {
  role: string;
}

interface OtherAssetTableProps {
  filteredAssets: OtherAsset[];
  user: User | null;
  onEdit: (asset: OtherAsset) => void;
  onDelete: (asset: OtherAsset) => void;
}

const OtherAssetTable: React.FC<OtherAssetTableProps> = ({
  filteredAssets,
  user,
  onEdit,
  onDelete
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách tài sản gửi kho ({filteredAssets.length} mục)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên tài sản</TableHead>
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
            {filteredAssets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell>{asset.name}</TableCell>
                <TableCell>{asset.deposit_date ? new Date(asset.deposit_date).toLocaleDateString('vi-VN') : ''}</TableCell>
                <TableCell>{asset.depositor}</TableCell>
                <TableCell>{asset.deposit_receiver}</TableCell>
                <TableCell>{asset.withdrawal_date ? new Date(asset.withdrawal_date).toLocaleDateString('vi-VN') : ''}</TableCell>
                <TableCell>{asset.withdrawal_deliverer}</TableCell>
                <TableCell>{asset.withdrawal_receiver}</TableCell>
                <TableCell className="max-w-xs truncate">{asset.notes}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => onEdit(asset)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    {user?.role === 'admin' && (
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => onDelete(asset)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default OtherAssetTable;
