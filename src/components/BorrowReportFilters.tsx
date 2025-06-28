import React, { useCallback } from 'react';
import { Filter, Building2, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import DateInput from '@/components/DateInput'; // Import the new DateInput

interface DateRange {
  start: string;
  end: string;
}

interface BorrowReportFiltersProps {
  dateRange: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
  selectedRoom: string;
  setSelectedRoom: (value: string) => void;
  rooms: string[];
}

const BorrowReportFilters = React.memo(({ 
  dateRange, 
  setDateRange, 
  selectedRoom, 
  setSelectedRoom, 
  rooms 
}: BorrowReportFiltersProps) => {
  const handleStartDateChange = useCallback((dateString: string) => { // dateString is YYYY-MM-DD
    setDateRange(prev => ({ ...prev, start: dateString }));
  }, [setDateRange]);

  const handleEndDateChange = useCallback((dateString: string) => { // dateString is YYYY-MM-DD
    setDateRange(prev => ({ ...prev, end: dateString }));
  }, [setDateRange]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Time Filter Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2 text-green-600" />
            Bộ lọc thời gian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                <Calendar className="w-4 h-4 inline mr-1" />
                Từ ngày
              </Label>
              <DateInput
                value={dateRange.start}
                onChange={handleStartDateChange}
                placeholder="Chọn ngày bắt đầu"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                <Calendar className="w-4 h-4 inline mr-1" />
                Đến ngày
              </Label>
              <DateInput
                value={dateRange.end}
                onChange={handleEndDateChange}
                placeholder="Chọn ngày kết thúc"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Room Filter Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-green-600" />
            Hiển thị danh sách theo từng phòng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn phòng..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả các phòng</SelectItem>
              {rooms.map((room) => (
                <SelectItem key={room} value={room}>
                  {room}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
});

BorrowReportFilters.displayName = 'BorrowReportFilters';

export default BorrowReportFilters;