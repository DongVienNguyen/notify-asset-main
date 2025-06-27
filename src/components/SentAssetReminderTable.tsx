
import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface SentAssetReminderTableProps {
  filteredSentReminders: any[];
  sentSearchTerm: string;
  setSentSearchTerm: (term: string) => void;
  isLoading: boolean;
  onDeleteSentReminder: (id: string) => void;
}

const SentAssetReminderTable: React.FC<SentAssetReminderTableProps> = ({
  filteredSentReminders,
  sentSearchTerm,
  setSentSearchTerm,
  isLoading,
  onDeleteSentReminder
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <Input
          placeholder="Tìm kiếm trong danh sách đã gửi..."
          value={sentSearchTerm}
          onChange={(e) => setSentSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên TS</TableHead>
            <TableHead>Ngày đến hạn</TableHead>
            <TableHead>CBQLN</TableHead>
            <TableHead>CBKH</TableHead>
            <TableHead>Ngày gửi</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSentReminders.map((reminder) => (
            <TableRow key={reminder.id}>
              <TableCell className="font-medium">{reminder.ten_ts}</TableCell>
              <TableCell>{reminder.ngay_den_han}</TableCell>
              <TableCell>{reminder.cbqln || 'Chưa chọn'}</TableCell>
              <TableCell>{reminder.cbkh || 'Chưa chọn'}</TableCell>
              <TableCell>{reminder.sent_date}</TableCell>
              <TableCell>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => onDeleteSentReminder(reminder.id)}
                  title="Xóa nhắc nhở đã gửi"
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {filteredSentReminders.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                Chưa có email nào được gửi
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default SentAssetReminderTable;
