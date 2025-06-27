
import React from 'react';
import { Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

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

interface OtherAssetSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredAssets: OtherAsset[];
}

const OtherAssetSearchBar: React.FC<OtherAssetSearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  filteredAssets
}) => {
  const exportToCSV = () => {
    const headers = ['Tên tài sản', 'Ngày gửi', 'Người gửi', 'Người nhận (gửi)', 'Ngày xuất', 'Người giao (xuất)', 'Người nhận (xuất)', 'Ghi chú'];
    const csvContent = [
      headers.join(','),
      ...filteredAssets.map(asset => [
        asset.name,
        asset.deposit_date,
        asset.depositor || '',
        asset.deposit_receiver || '',
        asset.withdrawal_date || '',
        asset.withdrawal_deliverer || '',
        asset.withdrawal_receiver || '',
        asset.notes || ''
      ].join(','))
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `tai-san-khac-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm tài sản..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={exportToCSV} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Xuất CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OtherAssetSearchBar;
