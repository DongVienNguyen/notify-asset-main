
import React from 'react';
import { Plus, Send, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';

interface CRCActionButtonsProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  onSendReminders: () => void;
  onExportToCSV: () => void;
  isLoading: boolean;
  children: React.ReactNode;
}

const CRCActionButtons: React.FC<CRCActionButtonsProps> = ({
  dialogOpen,
  setDialogOpen,
  onSendReminders,
  onExportToCSV,
  isLoading,
  children
}) => {
  return (
    <div className="flex gap-2">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm nhắc nhở mới
          </Button>
        </DialogTrigger>
        {children}
      </Dialog>
      
      <Button onClick={onSendReminders} className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
        <Send className="w-4 h-4 mr-2" />
        Gửi nhắc nhở
      </Button>
      
      <Button onClick={onExportToCSV} variant="outline" disabled={isLoading}>
        <Download className="w-4 h-4 mr-2" />
        Xuất CSV
      </Button>
    </div>
  );
};

export default CRCActionButtons;
