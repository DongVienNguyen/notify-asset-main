import { formatToDDMMYYYY } from './dateUtils';
import { Transaction } from '@/types/asset'; // Import the new interface

export interface GroupedRow {
  room: string;
  year: string;
  codes: string;
}

export const groupTransactions = (transactions: Transaction[]): GroupedRow[] => {
  if (!transactions || transactions.length === 0) return [];

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

  const result: GroupedRow[] = [];
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
};

interface FilterDisplayTextOptions {
  filterType: string;
  dateStrings: {
    morningTargetFormatted: string;
    nextWorkingDayFormatted: string;
    todayFormatted: string;
  };
  customFilters: {
    start: string;
    end: string;
  };
}

export const getFilterDisplayTextUtil = ({ filterType, dateStrings, customFilters }: FilterDisplayTextOptions): string => {
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