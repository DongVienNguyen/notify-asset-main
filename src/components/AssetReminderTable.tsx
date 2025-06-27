
import React from 'react';
import { Edit, Trash2, Mail, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AssetReminderTableProps {
  filteredReminders: any[];
  isLoading: boolean;
  onEdit: (reminder: any) => void;
  onDelete: (id: string) => void;
  onSendSingle: (reminder: any) => void;
  isDateDueOrOverdue: (dateStr: string) => boolean;
}

const AssetReminderTable: React.FC<AssetReminderTableProps> = ({
  filteredReminders,
  isLoading,
  onEdit,
  onDelete,
  onSendSingle,
  isDateDueOrOverdue
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  if (filteredReminders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Chưa có nhắc nhở nào
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tên TS</TableHead>
          <TableHead>Ngày đến hạn</TableHead>
          <TableHead>CBQLN</TableHead>
          <TableHead>CBKH</TableHead>
          <TableHead>Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredReminders.map((reminder) => (
          <TableRow key={reminder.id}>
            <TableCell className="font-medium">{reminder.ten_ts}</TableCell>
            <TableCell 
              className={`${isDateDueOrOverdue(reminder.ngay_den_han) ? 'bg-red-100 text-red-800 font-bold' : ''}`}
            >
              {reminder.ngay_den_han}
              {isDateDueOrOverdue(reminder.ngay_den_han) && (
                <AlertCircle className="w-4 h-4 inline ml-2 text-red-600" />
              )}
            </TableCell>
            <TableCell>{reminder.cbqln || 'Chưa chọn'}</TableCell>
            <TableCell>{reminder.cbkh || 'Chưa chọn'}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onSendSingle(reminder)}
                  disabled={!isDateDueOrOverdue(reminder.ngay_den_han) || isLoading}
                  title="Gửi email nhắc nhở tài sản"
                >
                  <Mail className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onEdit(reminder)} disabled={isLoading}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => onDelete(reminder.id)}
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AssetReminderTable;
