import { useState, useEffect, useMemo } from 'react';
import { getAssetTransactions } from '@/services/assetService';
import { toast } from 'sonner';
import { format } from 'date-fns';

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
}

interface DateRange {
  start: string;
  end: string;
}

export const useBorrowReportData = () => {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: format(new Date(), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getAssetTransactions();
        const borrowTransactions = data.filter(t => t.transaction_type === 'Mượn TS');
        setAllTransactions(borrowTransactions);
      } catch (error) {
        console.error("Error fetching borrow report data:", error);
        toast.error("Không thể tải dữ liệu báo cáo mượn tài sản.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(t => {
      const transactionDate = new Date(t.transaction_date);
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end) : null;

      if (startDate) startDate.setHours(0, 0, 0, 0);
      if (endDate) endDate.setHours(23, 59, 59, 999);

      const inDateRange = (!startDate || transactionDate >= startDate) && (!endDate || transactionDate <= endDate);
      const inRoom = selectedRoom === 'all' || t.room === selectedRoom;

      return inDateRange && inRoom;
    });
  }, [allTransactions, dateRange, selectedRoom]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

  const rooms = useMemo(() => {
    return [...new Set(allTransactions.map(t => t.room))].sort();
  }, [allTransactions]);

  const exportToCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.warning("Không có dữ liệu để xuất.");
      return;
    }

    const headers = ['STT', 'Phòng', 'Năm TS', 'Mã TS', 'Loại', 'Ngày', 'CB'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map((t, index) => [
        index + 1,
        t.room,
        t.asset_year,
        t.asset_code,
        t.transaction_type,
        format(new Date(t.transaction_date), 'dd/MM/yyyy'),
        t.staff_code
      ].join(','))
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `BaoCaoTaiSanDaMuon_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Xuất file Excel thành công!");
  };

  return {
    isLoading,
    dateRange,
    setDateRange,
    selectedRoom,
    setSelectedRoom,
    currentPage,
    setCurrentPage,
    filteredTransactions,
    paginatedTransactions,
    totalPages,
    rooms,
    ITEMS_PER_PAGE,
    exportToCSV,
  };
};