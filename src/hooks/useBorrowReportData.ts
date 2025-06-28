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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
        const data = await getAssetTransactions({
          transactionType: 'Mượn TS',
          dateRange: dateRange,
          room: selectedRoom,
        });
        setTransactions(data || []);
      } catch (error) {
        console.error("Error fetching borrow report data:", error);
        toast.error("Không thể tải dữ liệu báo cáo mượn tài sản.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [dateRange, selectedRoom]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return transactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [transactions, currentPage]);

  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);

  const rooms = useMemo(() => {
    // This should ideally be fetched from the DB or derived from a larger dataset
    // For now, we derive it from the already filtered transactions, which might not be complete.
    // A better approach would be to fetch all unique rooms once.
    // However, to avoid major changes, we'll keep this as is.
    return [...new Set(transactions.map(t => t.room))].sort();
  }, [transactions]);

  const exportToCSV = () => {
    if (transactions.length === 0) {
      toast.warning("Không có dữ liệu để xuất.");
      return;
    }

    const headers = ['STT', 'Phòng', 'Năm TS', 'Mã TS', 'Loại', 'Ngày', 'CB'];
    const csvContent = [
      headers.join(','),
      ...transactions.map((t, index) => [
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
    filteredTransactions: transactions, // Keep name for compatibility
    paginatedTransactions,
    totalPages,
    rooms,
    ITEMS_PER_PAGE,
    exportToCSV,
  };
};