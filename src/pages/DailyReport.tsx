import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FileText, Download, ListTree, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { getAssetTransactions } from '@/services/assetService';
import { formatToDDMMYYYY } from '@/utils/dateUtils';
import DateInput from '@/components/DateInput';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Transaction {
  id: string;
  staff_code: string;
  transaction_date: string;
  parts_day: string;
  room: string;
  transaction_type: string;
  asset_year: number;
  asset_code: number;
  note: string;
  created_at?: string;
}

const DailyReport = () => {
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showGrouped, setShowGrouped] = useState(true);
  const [filterType, setFilterType] = useState('qln_pgd_next_day');
  const [customFilters, setCustomFilters] = useState({
    start: '',
    end: '',
    parts_day: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const ITEMS_PER_PAGE = 10;

  // Auto-scroll to results on mobile when data loads
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile && filteredTransactions.length > 0 && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 300);
    }
  }, [filteredTransactions]);

  // Fixed timezone handling function
  const getGMTPlus7Date = () => {
    const now = new Date();
    // Create a date in GMT+7 timezone
    const gmtPlus7 = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Bangkok"}));
    return gmtPlus7;
  };

  const getDateBasedOnTime = () => {
    const gmtPlus7 = getGMTPlus7Date();
    const hours = gmtPlus7.getHours();
    const minutes = gmtPlus7.getMinutes();
    const dayOfWeek = gmtPlus7.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Check if current time is between 08:06 and 23:59
    const isAfter0806 = hours > 8 || (hours === 8 && minutes >= 6);
    
    if (isAfter0806) {
      // Get next working day
      let nextDay = new Date(gmtPlus7);
      
      if (dayOfWeek === 5) { // Friday
        nextDay.setDate(gmtPlus7.getDate() + 3); // Monday
      } else if (dayOfWeek === 6) { // Saturday
        nextDay.setDate(gmtPlus7.getDate() + 2); // Monday
      } else if (dayOfWeek === 0) { // Sunday
        nextDay.setDate(gmtPlus7.getDate() + 1); // Monday
      } else {
        nextDay.setDate(gmtPlus7.getDate() + 1); // Next day
      }
      
      return nextDay;
    } else {
      // Between 00:01 and 08:05, return current day
      return gmtPlus7;
    }
  };

  const getNextWorkingDay = (date: Date) => {
    const day = date.getDay();
    let nextDay = new Date(date);
    
    if (day === 5) { // Friday
      nextDay.setDate(date.getDate() + 3); // Monday
    } else if (day === 6) { // Saturday
      nextDay.setDate(date.getDate() + 2); // Monday
    } else {
      nextDay.setDate(date.getDate() + 1); // Next day
    }
    
    return nextDay;
  };

  const getDefaultEndDate = () => {
    const gmtPlus7 = getGMTPlus7Date();
    const tomorrow = new Date(gmtPlus7);
    tomorrow.setDate(gmtPlus7.getDate() + 1);
    
    // Check if tomorrow is Saturday (6) or Sunday (0)
    if (tomorrow.getDay() === 6) { // Saturday
      tomorrow.setDate(tomorrow.getDate() + 2); // Move to Monday
    } else if (tomorrow.getDay() === 0) { // Sunday
      tomorrow.setDate(tomorrow.getDate() + 1); // Move to Monday
    }
    
    return tomorrow;
  };

  const loadTransactionsForFilter = async (filterType: string, customFilters?: any) => {
    setIsLoading(true);
    try {
      console.log('Loading transactions for filter:', filterType);
      
      const data = await getAssetTransactions();
      
      // Filter data based on selected filter type
      let filtered = [...data];
      const gmtPlus7 = getGMTPlus7Date();
      const todayStr = gmtPlus7.toISOString().split('T')[0];
      const morningTargetDate = getDateBasedOnTime();
      const morningTargetStr = morningTargetDate.toISOString().split('T')[0];
      const nextWorkingDay = getNextWorkingDay(gmtPlus7);
      const nextWorkingDayStr = nextWorkingDay.toISOString().split('T')[0];

      console.log('Filter dates:', {
        today: todayStr,
        morningTarget: morningTargetStr,
        nextWorkingDay: nextWorkingDayStr,
        filterType
      });

      switch (filterType) {
        case 'qln_pgd_next_day':
          filtered = filtered.filter(t => 
            t.transaction_date === morningTargetStr && 
            (t.parts_day === 'Sáng' || (t.parts_day === 'Chiều' && ['CMT8', 'NS', 'ĐS', 'LĐH'].includes(t.room)))
          );
          break;
        case 'morning':
          filtered = filtered.filter(t => 
            t.transaction_date === morningTargetStr && t.parts_day === 'Sáng'
          );
          break;
        case 'afternoon':
          // Fixed: afternoon should filter by next working day, not today
          filtered = filtered.filter(t => 
            t.transaction_date === nextWorkingDayStr && t.parts_day === 'Chiều'
          );
          break;
        case 'today':
          filtered = filtered.filter(t => t.transaction_date === todayStr);
          break;
        case 'next_day':
          filtered = filtered.filter(t => t.transaction_date === nextWorkingDayStr);
          break;
        case 'custom':
          if (customFilters?.start && customFilters?.end) {
            filtered = filtered.filter(t => {
              const matchDate = t.transaction_date >= customFilters.start && t.transaction_date <= customFilters.end;
              const matchPartsDay = customFilters.parts_day === 'all' || t.parts_day === customFilters.parts_day;
              return matchDate && matchPartsDay;
            });
          } else {
            filtered = []; // Don't show any data if date range is not set
          }
          break;
      }

      console.log('Filtered transactions:', filtered.length);

      // Transform and sort data
      const transformedData = filtered.map(transaction => ({
        id: transaction.id,
        staff_code: transaction.staff_code,
        transaction_date: transaction.transaction_date,
        parts_day: transaction.parts_day,
        room: transaction.room,
        transaction_type: transaction.transaction_type,
        asset_year: transaction.asset_year,
        asset_code: transaction.asset_code,
        note: transaction.note || '',
        created_at: transaction.created_at
      })).sort((a, b) => {
        if (a.room !== b.room) return a.room.localeCompare(b.room);
        if (a.asset_year !== b.asset_year) return a.asset_year - b.asset_year;
        return a.asset_code - b.asset_code;
      });
      
      setFilteredTransactions(transformedData);
      setCurrentPage(1); // Reset to first page when filter changes
      
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error("Không thể tải dữ liệu từ cơ sở dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when filter changes (but not for custom)
  useEffect(() => {
    if (filterType !== 'custom') {
      loadTransactionsForFilter(filterType);
    } else {
      // Clear data when switching to custom until user clicks filter
      setFilteredTransactions([]);
    }
  }, [filterType]);

  // Initialize default custom filter dates
  useEffect(() => {
    const gmtPlus7 = getGMTPlus7Date();
    const defaultEnd = getDefaultEndDate();
    
    setCustomFilters({
      start: gmtPlus7.toISOString().split('T')[0],
      end: defaultEnd.toISOString().split('T')[0],
      parts_day: 'all'
    });
  }, []);

  const getMorningTargetDate = () => {
    return getDateBasedOnTime();
  };

  const groupedRows = useMemo(() => {
    const groups: { [key: string]: { [year: string]: number[] } } = {};
    
    filteredTransactions.forEach(t => {
      if (!groups[t.room]) groups[t.room] = {};
      if (!groups[t.room][t.asset_year]) groups[t.room][t.asset_year] = [];
      groups[t.room][t.asset_year].push(t.asset_code);
    });

    // Create frequency map for asterisk marking (only for current week)
    const frequencyMap = new Map<string, number>();
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Sunday

    // Only count frequency from filtered transactions within current week
    filteredTransactions.forEach(t => {
      const tDate = new Date(t.transaction_date);
      if (tDate >= weekStart && tDate <= weekEnd) {
        const key = `${t.room}-${t.asset_year}-${t.asset_code}`;
        frequencyMap.set(key, (frequencyMap.get(key) || 0) + 1);
      }
    });

    const result = [];
    for (const room of Object.keys(groups).sort()) {
      for (const year of Object.keys(groups[room]).sort()) {
        const codes = [...new Set(groups[room][year])].sort((a, b) => a - b);
        const codesWithAsterisk = codes.map(code => {
          const key = `${room}-${year}-${code}`;
          return frequencyMap.get(key) && frequencyMap.get(key)! > 1 ? `${code}*` : code.toString();
        });
        
        result.push({
          room,
          year,
          codes: codesWithAsterisk.join(', ')
        });
      }
    }
    
    return result;
  }, [filteredTransactions]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

  const exportToPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      window.print();
      setIsExporting(false);
    }, 500);
  };

  const getFilterDisplayText = () => {
    const gmtPlus7 = getGMTPlus7Date();
    const todayFormatted = formatToDDMMYYYY(gmtPlus7);
    const morningTarget = formatToDDMMYYYY(getMorningTargetDate());
    const nextWorking = formatToDDMMYYYY(getNextWorkingDay(gmtPlus7));

    switch (filterType) {
      case 'qln_pgd_next_day':
        return `QLN Sáng & PGD trong ngày (${morningTarget})`;
      case 'morning':
        return `Sáng ngày (${morningTarget})`;
      case 'afternoon':
        // Fixed: show next working day for afternoon
        return `Chiều ngày (${nextWorking})`;
      case 'today':
        return `Trong ngày hôm nay (${todayFormatted})`;
      case 'next_day':
        return `Trong ngày kế tiếp (${nextWorking})`;
      case 'custom':
        return customFilters.start && customFilters.end 
          ? `Từ ${formatToDDMMYYYY(new Date(customFilters.start))} đến ${formatToDDMMYYYY(new Date(customFilters.end))}`
          : 'Tùy chọn khoảng thời gian';
      default:
        return '';
    }
  };

  if (isLoading && !isExporting) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Danh sách TS cần lấy</h1>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2 text-green-600" />
              Bộ lọc danh sách cần xem:
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={filterType} onValueChange={setFilterType} className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="morning" id="morning" />
                <Label htmlFor="morning">Sáng ngày ({formatToDDMMYYYY(getMorningTargetDate())})</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="qln_pgd_next_day" id="qln_pgd_next_day" />
                <Label htmlFor="qln_pgd_next_day">QLN Sáng & PGD trong ngày ({formatToDDMMYYYY(getMorningTargetDate())})</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="afternoon" id="afternoon" />
                <Label htmlFor="afternoon">Chiều ngày ({formatToDDMMYYYY(getNextWorkingDay(getGMTPlus7Date()))})</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="today" id="today" />
                <Label htmlFor="today">Trong ngày hôm nay ({formatToDDMMYYYY(getGMTPlus7Date())})</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="next_day" id="next_day" />
                <Label htmlFor="next_day">Trong ngày kế tiếp ({formatToDDMMYYYY(getNextWorkingDay(getGMTPlus7Date()))})</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom">Tùy chọn khoảng thời gian</Label>
              </div>
            </RadioGroup>

            {filterType === 'custom' && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Chọn buổi</Label>
                  <Select 
                    value={customFilters.parts_day} 
                    onValueChange={(value) => setCustomFilters(prev => ({ ...prev, parts_day: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn buổi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="Sáng">Sáng</SelectItem>
                      <SelectItem value="Chiều">Chiều</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Từ ngày</Label>
                  <DateInput
                    value={customFilters.start}
                    onChange={(value) => setCustomFilters(prev => ({ ...prev, start: value }))}
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Đến ngày</Label>
                  <DateInput
                    value={customFilters.end}
                    onChange={(value) => setCustomFilters(prev => ({ ...prev, end: value }))}
                  />
                </div>
                <Button onClick={() => loadTransactionsForFilter('custom', customFilters)}>
                  Lọc
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons - Moved to the right */}
        <div className="flex justify-end space-x-4">
          <Button 
            onClick={exportToPDF}
            disabled={isExporting}
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Đang xuất...' : 'Xuất PDF'}
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowGrouped(!showGrouped)}
            className="text-purple-600 border-purple-600 hover:bg-purple-50"
          >
            <ListTree className="w-4 h-4 mr-2" />
            {showGrouped ? 'Hiện chi tiết' : 'Hiện DS tổng'}
          </Button>
        </div>

        {/* Results */}
        <div id="print-section" ref={resultsRef}>
          {showGrouped ? (
            <Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <CardHeader>
                <CardTitle>{getFilterDisplayText()}</CardTitle>
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
                        <TableCell colSpan={3} className="text-center text-gray-500">
                          Không có dữ liệu
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <CardHeader>
                <CardTitle>
                  Danh sách tài sản cần lấy ({filteredTransactions.length} bản ghi)
                </CardTitle>
                <p className="text-sm text-gray-600">{getFilterDisplayText()}</p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phòng</TableHead>
                      <TableHead>Năm TS</TableHead>
                      <TableHead>Mã TS</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Buổi</TableHead>
                      <TableHead>Ghi chú</TableHead>
                      <TableHead>CB</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTransactions.length > 0 ? (
                      paginatedTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{transaction.room}</TableCell>
                          <TableCell>{transaction.asset_year}</TableCell>
                          <TableCell>{transaction.asset_code}</TableCell>
                          <TableCell>{transaction.transaction_type}</TableCell>
                          <TableCell>{formatToDDMMYYYY(transaction.transaction_date)}</TableCell>
                          <TableCell>{transaction.parts_day}</TableCell>
                          <TableCell>{transaction.note}</TableCell>
                          <TableCell>{transaction.staff_code}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-gray-500">
                          Không có dữ liệu
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Trước
                    </Button>
                    
                    <span className="text-sm text-gray-600">
                      Trang {currentPage} trên {totalPages}
                    </span>
                    
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Tiếp
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-section, #print-section * {
            visibility: visible;
          }
          #print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </Layout>
  );
};

export default DailyReport;