import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getAssetTransactions, AssetTransactionFilters } from '@/services/assetService';
import { 
  formatToDDMMYYYY,
  getGMTPlus7Date,
  getNextWorkingDay,
  getDateBasedOnTime,
  getDefaultEndDate
} from '@/utils/dateUtils';

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

export const useDailyReportLogic = () => {
  // UI State
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

  // Initialize date values once using useState with a function initializer
  // This ensures they are calculated only on the initial render and remain stable.
  const [gmtPlus7Date] = useState(() => getGMTPlus7Date());
  const [morningTargetDate] = useState(() => getDateBasedOnTime());
  const [nextWorkingDayDate] = useState(() => getNextWorkingDay(gmtPlus7Date)); // Use gmtPlus7Date for consistency
  const [defaultEndDate] = useState(() => getDefaultEndDate());

  const dateStrings = useMemo(() => ({
    todayFormatted: formatToDDMMYYYY(gmtPlus7Date),
    morningTargetFormatted: formatToDDMMYYYY(morningTargetDate),
    nextWorkingDayFormatted: formatToDDMMYYYY(nextWorkingDayDate),
  }), [gmtPlus7Date, morningTargetDate, nextWorkingDayDate]);

  // Derive filters based on filterType and customFilters
  const currentQueryFilters = useMemo(() => {
    const filters: AssetTransactionFilters = {};
    const todayStr = gmtPlus7Date.toISOString().split('T')[0];
    const morningTargetStr = morningTargetDate.toISOString().split('T')[0];
    const nextWorkingDayStr = nextWorkingDayDate.toISOString().split('T')[0];

    if (filterType === 'custom') {
      if (customFilters.start && customFilters.end) {
        filters.startDate = customFilters.start;
        filters.endDate = customFilters.end;
        filters.parts_day = customFilters.parts_day as 'Sáng' | 'Chiều' | 'all';
      } else {
        // If custom filters are not fully set, return an empty object to disable query
        return {};
      }
    } else {
      switch (filterType) {
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
        default:
          // Should not happen if filterType is always one of the defined cases
          return {};
      }
    }
    return filters;
  }, [filterType, customFilters, gmtPlus7Date, morningTargetDate, nextWorkingDayDate]); // Dependencies for memoization

  // Effect to initialize custom filter dates
  useEffect(() => {
    setCustomFilters({
      start: gmtPlus7Date.toISOString().split('T')[0],
      end: defaultEndDate.toISOString().split('T')[0],
      parts_day: 'all'
    });
  }, [gmtPlus7Date, defaultEndDate]); // Now depends on stable date state variables

  // Data fetching with React Query
  const { data: transactions = [], isLoading } = useQuery<Transaction[], Error>({
    queryKey: ['assetTransactions', currentQueryFilters],
    queryFn: () => getAssetTransactions(currentQueryFilters),
    enabled: !!currentQueryFilters.startDate, // Only run query if filters have a start date
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error) => {
      console.error('Error loading transactions:', error);
      toast.error(`Không thể tải dữ liệu: ${error.message}`);
    }
  });
  
  // Reset page number when transactions data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [transactions]);

  // Scroll effect for mobile
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile && transactions.length > 0 && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [transactions]);

  // Handler for the custom filter button
  const handleCustomFilter = () => {
    if (customFilters.start && customFilters.end) {
      setFilterType('custom'); // This will trigger currentQueryFilters re-evaluation and then useQuery
    } else {
      toast.warning("Vui lòng chọn cả ngày bắt đầu và ngày kết thúc.");
    }
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