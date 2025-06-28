import { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getAssetTransactions } from '@/services/assetService';
import { format, addDays, getDay } from 'date-fns'; // Add format, addDays, getDay

interface AssetTransaction {
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

interface DateRange {
  start: string;
  end: string;
}

export const useBorrowReportData = () => {
  const [allTransactions, setAllTransactions] = useState<AssetTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: '',
    end: ''
  });
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  
  const ITEMS_PER_PAGE = 10;

  // Memoized function to get next working day
  const getNextWorkingDay = useCallback((date: Date) => {
    const nextDay = new Date(date); // Creates a copy
    nextDay.setDate(date.getDate() + 1); // Adds 1 day to the copy
    
    if (getDay(nextDay) === 6) { // If it's Saturday
      nextDay.setDate(nextDay.getDate() + 2); // Add 2 more days (to Monday)
    } else if (getDay(nextDay) === 0) { // If it's Sunday
      nextDay.setDate(nextDay.getDate() + 1); // Add 1 more day (to Monday)
    }
    
    return nextDay;
  }, []);

  // Optimized cache mechanism
  const fetchWithCache = useCallback(async () => {
    const cacheKey = 'assetTransactions';
    const cacheTimeKey = 'assetTransactionsTime';
    const cacheExpiry = 5 * 60 * 1000; // 5 minutes
    
    const cachedData = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(cacheTimeKey);
    
    if (cachedData && cachedTime) {
      const now = Date.now();
      const cacheAge = now - parseInt(cachedTime);
      
      if (cacheAge < cacheExpiry) {
        return JSON.parse(cachedData);
      }
    }
    
    const data = await getAssetTransactions();
    const limitedData = data.slice(0, 3000);
    
    localStorage.setItem(cacheKey, JSON.stringify(limitedData));
    localStorage.setItem(cacheTimeKey, Date.now().toString());
    
    return limitedData;
  }, []);

  // Initialize default date range with GMT+7
  useEffect(() => {
    const now = new Date();
    // Calculate GMT+7 date
    const gmtPlus7Offset = 7 * 60; // 7 hours in minutes
    const localOffset = now.getTimezoneOffset(); // Offset in minutes for local timezone
    const totalOffset = gmtPlus7Offset + localOffset;
    
    const gmtPlus7Date = new Date(now.getTime() + (totalOffset * 60 * 1000));
    
    // Get the start of the day for GMT+7
    const todayGMT7 = new Date(gmtPlus7Date.getFullYear(), gmtPlus7Date.getMonth(), gmtPlus7Date.getDate());
    
    // Calculate next working day based on todayGMT7
    const nextWorkingDayGMT7 = getNextWorkingDay(todayGMT7);
    
    setDateRange({
      start: format(todayGMT7, 'yyyy-MM-dd'), // Format to YYYY-MM-DD
      end: format(nextWorkingDayGMT7, 'yyyy-MM-dd') // Format to YYYY-MM-DD
    });
  }, [getNextWorkingDay]);

  // Load transactions with error handling
  useEffect(() => {
    const loadAllTransactions = async () => {
      setIsLoading(true);
      try {
        const data = await fetchWithCache();
        setAllTransactions(data);
      } catch (error) {
        console.error('Error loading transactions:', error);
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu từ cơ sở dữ liệu",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAllTransactions();
  }, [fetchWithCache, toast]);

  // Memoized exported asset keys for better performance
  const exportedAssetKeys = useMemo(() => {
    const keys = new Set<string>();
    allTransactions.forEach(t => {
      if (t.transaction_type === 'Xuất kho') {
        const assetKey = `${t.room}-${t.asset_year}-${t.asset_code}`;
        keys.add(assetKey);
      }
    });
    return keys;
  }, [allTransactions]);

  // Optimized filtering logic
  const filteredTransactions = useMemo(() => {
    // Step 1: Find borrowed assets that haven't been returned
    const borrowedAssets = allTransactions.filter(t => {
      if (t.transaction_type !== 'Mượn TS') return false;
      
      const assetKey = `${t.room}-${t.asset_year}-${t.asset_code}`;
      return !exportedAssetKeys.has(assetKey);
    });

    // Step 2: Apply filters
    let filtered = borrowedAssets;

    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(t => 
        t.transaction_date >= dateRange.start && 
        t.transaction_date <= dateRange.end
      );
    }

    if (selectedRoom !== 'all') {
      filtered = filtered.filter(t => t.room === selectedRoom);
    }

    // Step 3: Sort results
    return filtered.sort((a, b) => {
      if (a.room !== b.room) return a.room.localeCompare(b.room);
      if (a.asset_year !== b.asset_year) return a.asset_year - b.asset_year;
      return a.asset_code - b.asset_code;
    });
  }, [allTransactions, exportedAssetKeys, dateRange, selectedRoom]);

  // Memoized pagination
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

  // Memoized unique rooms
  const rooms = useMemo(() => {
    const uniqueRooms = [...new Set(allTransactions.map(t => t.room))].sort();
    return uniqueRooms;
  }, [allTransactions]);

  return {
    allTransactions,
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
    ITEMS_PER_PAGE
  };
};