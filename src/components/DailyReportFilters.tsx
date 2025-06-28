import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DateInput from '@/components/DateInput';

interface DailyReportFiltersProps {
  filterType: string;
  setFilterType: (value: string) => void;
  customFilters: { start: string; end: string; parts_day: string; };
  setCustomFilters: (value: any) => void;
  handleCustomFilter: () => void;
  dateStrings: {
    todayFormatted: string;
    morningTargetFormatted: string;
    nextWorkingDayFormatted: string;
  };
}

const DailyReportFilters: React.FC<DailyReportFiltersProps> = ({
  filterType,
  setFilterType,
  customFilters,
  setCustomFilters,
  handleCustomFilter,
  dateStrings,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Filter className="w-5 h-5 mr-2 text-green-600" />
          Bộ lọc danh sách cần xem:
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={filterType} onValueChange={setFilterType} className="space-y-3">
          <div className="flex items-center space-x-2"><RadioGroupItem value="morning" id="morning" /><Label htmlFor="morning">Sáng ngày ({dateStrings.morningTargetFormatted})</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="qln_pgd_next_day" id="qln_pgd_next_day" /><Label htmlFor="qln_pgd_next_day">QLN Sáng & PGD trong ngày ({dateStrings.morningTargetFormatted})</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="afternoon" id="afternoon" /><Label htmlFor="afternoon">Chiều ngày ({dateStrings.nextWorkingDayFormatted})</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="today" id="today" /><Label htmlFor="today">Trong ngày hôm nay ({dateStrings.todayFormatted})</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="next_day" id="next_day" /><Label htmlFor="next_day">Trong ngày kế tiếp ({dateStrings.nextWorkingDayFormatted})</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="custom" id="custom" /><Label htmlFor="custom">Tùy chọn khoảng thời gian</Label></div>
        </RadioGroup>

        {filterType === 'custom' && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Chọn buổi</Label>
              <Select value={customFilters.parts_day} onValueChange={(value) => setCustomFilters((prev: any) => ({ ...prev, parts_day: value }))}>
                <SelectTrigger><SelectValue placeholder="Chọn buổi" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="Sáng">Sáng</SelectItem>
                  <SelectItem value="Chiều">Chiều</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Từ ngày</Label>
              <DateInput value={customFilters.start} onChange={(value) => setCustomFilters((prev: any) => ({ ...prev, start: value }))} />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Đến ngày</Label>
              <DateInput value={customFilters.end} onChange={(value) => setCustomFilters((prev: any) => ({ ...prev, end: value }))} />
            </div>
            <Button onClick={handleCustomFilter}>Lọc</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyReportFilters;