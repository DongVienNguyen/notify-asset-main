import React from 'react';
import { Edit, Trash2, Mail, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface CRCReminderTableProps {
  filteredReminders: any[];
  isLoading: boolean;
  isDayMonthDueOrOverdue: (dateStr: string) => boolean;
  onSendSingleReminder: (reminder: any) => void;
  onEdit: (reminder: any) => void;
  onDelete: (id: string) => void;
}

const CRCReminderTable: React.FC<CRCReminderTableProps> = ({
  filteredReminders,
  isLoading,
  isDayMonthDueOrOverdue,
  onSendSingleReminder,
  onEdit,
  onDelete
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Loại BT CRC</TableHead>
          <TableHead>Ngày thực hiện</TableHead>
          <TableHead>LDPCRC</TableHead>
          <TableHead>CBCRC</TableHead>
          <TableHead>QUYÇRC</TableHead>
          <TableHead>Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredReminders.map((reminder) => (
          <TableRow key={reminder.id}>
            <TableCell className="font-medium">{reminder.loai_bt_crc}</TableCell>
            <TableCell 
              className={`${isDayMonthDueOrOverdue(reminder.ngay_thuc_hien) ? 'bg-red-100 text-red-800 font-bold' : ''}`}
            >
              {reminder.ngay_thuc_hien}
              {isDayMonthDueOrOverdue(reminder.ngay_thuc_hien) && (
                <AlertCircle className="w-4 h-4 inline ml-2 text-red-600" />
              )}
            </TableCell>
            <TableCell>{reminder.ldpcrc || 'Chưa chọn'}</TableCell>
            <TableCell>{reminder.cbcrc || 'Chưa chọn'}</TableCell>
            <TableCell>{reminder.quycrc || 'Chưa chọn'}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onSendSingleReminder(reminder)}
                  disabled={!isDayMonthDueOrOverdue(reminder.ngay_thuc_hien) || isLoading}
                  title="Gửi email nhắc nhở CRC"
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
        {filteredReminders.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
              Chưa có nhắc nhở nào
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default CRCReminderTable;