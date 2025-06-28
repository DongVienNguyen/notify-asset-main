import React, { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { getAssetTransactions, AssetTransactionFilters } from '@/services/assetService';
import { formatToDDMMYYYY } from '@/utils/dateUtils';

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

// Helper date functions
const getGMTPlus7Date = () => new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));

const getNextWorkingDay = (date: Date) => {
  const day = date.getDay();
  let nextDay = new Date(date);
  if (day === 5) nextDay.setDate(date.getDate() + 3);
  else if (day === 6) nextDay.setDate(date.getDate() + 2);
  else nextDay.setDate(date.getDate() + 1);
  return nextDay;
};

const getDateBasedOnTime = () => {
  const gmtPlus7 = getGMTPlus7Date();
  const hours = gmtPlus7.getHours();
  const minutes = gmtPlus7.getMinutes();
  const isAfter0806 = hours > 8 || (hours === 8 && minutes >= 6);
  return isAfter0806 ? getNextWorkingDay(gmtPlus7) : gmtPlus7;
};

const getDefaultEndDate = () => {
  const gmtPlus7 = getGMTPlus7Date();
  const tomorrow = new Date(gmtPlus7);
  tomorrow.setDate(gmtPlus7.getDate() + 1);
  if (tomorrow.getDay() === 6) tomorrow.setDate(tomorrow.getDate() + 2);
  else if (tomorrow.getDay() === 0) tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
};

export const useDailyReportLogic = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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

  const dateValues = useMemo(() => ({
    gmtPlus7: getGMTPlus7Date(),
    morningTargetDate: getDateBasedOnTime(),
    nextWorkingDay: getNextWorkingDay(getGMTPlus7Date()),
  }), []);

  const dateStrings = useMemo(() => ({
    todayFormatted: formatToDDMMYYYY(dateValues.gmtPlus7),
    morningTargetFormatted: formatToDDMMYYYY(dateValues.morningTargetDate),
    nextWorkingDayFormatted: formatToDDMMYYYY(dateValues.nextWorkingDay),
  }), [dateValues]);

  const loadTransactions = async (currentFilterType: string, currentCustomFilters: typeof customFilters) => {
    setIsLoading(true);
    try {
      const filters: AssetTransactionFilters = {};
      const todayStr = dateValues.gmtPlus7.toISOString().split('T')[0];
      const morningTargetStr = dateValues.morningTargetDate.toISOString().split('T')[0];
      const nextWorkingDayStr = dateValues.nextWorkingDay.toISOString().split('T')[0];

      switch (currentFilterType) {
        case 'qln_pgd_next_day':
          filters.isQlnPgdNextDay = true;
          filters.startDate = morningTargetStr;
          break;
        case 'morning':
          filters.startDate = morningTargetStr;
          filters.endDate = morningTargetStr;
          filters.parts_day = 'Sáng';
          break;
        case 'afternoon':
          filters.startDate = nextWorkingDayStr;
          filters.endDate = nextWorkingDayStr;
          filters.parts_day = 'Chiều';
          break;
        case 'today':
          filters.startDate = todayStr;
          filters.endDate = todayStr;
          break;
        case 'next_day':
          filters.startDate = nextWorkingDayStr;
          filters.endDate = nextWorkingDayStr;
          break;
        case 'custom':
          if (currentCustomFilters.start && currentCustomFilters.end) {
            filters.startDate = currentCustomFilters.start;
            filters.endDate = currentCustomFilters.end;
            filters.parts_day = currentCustomFilters.parts_day as 'Sáng' | 'Chiều' | 'all';
          } else {
            setTransactions([]);
            setIsLoading(false);
            return;
          }
          break;
        default:
          setTransactions([]);
          setIsLoading(false);
          return;
      }

      const data = await getAssetTransactions(filters);
      setTransactions(data);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error("Không thể tải dữ liệu từ cơ sở dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (filterType !== 'custom') {
      loadTransactions(filterType, customFilters);
    } else {
      setTransactions([]);
    }
  }, [filterType, dateValues]);

  useEffect(() => {
    setCustomFilters({
      start: dateValues.gmtPlus7.toISOString().split('T')[0],
      end: getDefaultEndDate().toISOString().split('T')[0],
      parts_day: 'all'
    });
  }, [dateValues]);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile && transactions.length > 0 && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [transactions]);

  const handleCustomFilter = () => {
    loadTransactions('custom', customFilters);
  };

  const groupedRows = useMemo(() => {
    const groups: { [key: string]: { [year: string]: number[] } } = {};
    transactions.forEach(t => {
      if (!groups[t.room]) groups[t.room] = {};
      if (!groups[t.room][t.asset_year]) groups[t.room][t.asset_year] = [];
      groups[t.room][t.asset_year].push(t.asset_code);
    });

    const frequencyMap = new Map<string, number>();
    transactions.forEach(t => {
      const key = `${t.room}-${t.asset_year}-${t.asset_code}`;
      frequencyMap.set(key, (frequencyMap.get(key) || 0) + 1);
    });

    const result = [];
    for (const room of Object.keys(groups).sort()) {
      for (const year of Object.keys(groups[room]).sort()) {
        const codes = [...new Set(groups[room][year])].sort((a, b) => a - b);
        const codesWithAsterisk = codes.map(code => {
          const key = `${room}-${year}-${code}`;
          return frequencyMap.get(key)! > 1 ? `${code}*` : code.toString();
        });
        result.push({ room, year, codes: codesWithAsterisk.join(', ') });
      }
    }
    return result;
  }, [transactions]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return transactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [transactions, currentPage]);

  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);

  const exportToPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      window.print();
      setIsExporting(false);
    }, 500);
  };

  const getFilterDisplayText = () => {
    switch (filterType) {
      case 'qln_pgd_next_day': return `QLN Sáng & PGD trong ngày (${dateStrings.morningTargetFormatted})`;
      case 'morning': return `Sáng ngày (${dateStrings.morningTargetFormatted})`;
      case 'afternoon': return `Chiều ngày (${dateStrings.nextWorkingDayFormatted})`;
      case 'today': return `Trong ngày hôm nay (${dateStrings.todayFormatted})`;
      case 'next_day': return `Trong ngày kế tiếp (${dateStrings.nextWorkingDayFormatted})`;
      case 'custom':
        return customFilters.start && customFilters.end 
          ? `Từ ${formatToDDMMYYYY(new Date(customFilters.start))} đến ${formatToDDMMYYYY(new Date(customFilters.end))}`
          : 'Tùy chọn khoảng thời gian';
      default: return '';
    }
  };

  return {
    transactions,
    isLoading,
    isExporting,
    showGrouped,
    setShowGrouped,
    filterType,
    setFilterType,
    customFilters,
    setCustomFilters,
    currentPage,
    setCurrentPage,
    resultsRef,
    handleCustomFilter,
    groupedRows,
    paginatedTransactions,
    totalPages,
    exportToPDF,
    getFilterDisplayText,
    dateStrings,
  };
};