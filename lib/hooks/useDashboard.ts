import { useMemo } from 'react';
import { useStats } from '@/lib/hooks/useQuery';

interface StatData {
  total: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  previous: string;
}

interface DashboardStats {
  lokerStats: StatData;
  barangStats: StatData;
  kategoriStats: StatData;
}

export function useDashboard() {
  const { data: stats, isLoading: isLoadingStats } = useStats();

  // Calculate locker stats
  const lokerStats = useMemo(() => {
    if (!stats) {
      return { total: '0', change: '0%', changeType: 'neutral' as const, previous: '0' };
    }

    const totalNow = stats.totalNow || 0;
    const totalYesterday = stats.totalYesterday || 0;
    const formatter = new Intl.NumberFormat('id-ID');

    let percent = 0;
    if (totalYesterday === 0) {
      percent = totalNow > 0 ? 100 : 0;
    } else {
      percent = Math.round(((totalNow - totalYesterday) / totalYesterday) * 100);
    }

    let changeType: 'increase' | 'decrease' | 'neutral' = 'neutral';
    if (totalNow > totalYesterday) changeType = 'increase';
    else if (totalNow < totalYesterday) changeType = 'decrease';

    return {
      total: formatter.format(totalNow),
      change: `${Math.abs(percent)}%`,
      changeType,
      previous: formatter.format(totalYesterday),
    };
  }, [stats]);

  // Calculate item stats
  const barangStats = useMemo(() => {
    if (!stats) {
      return { total: '0', change: '0%', changeType: 'neutral' as const, previous: '0' };
    }

    const itemsNow = stats.totalItemsNow || 0;
    const itemsYesterday = stats.totalItemsYesterday || 0;
    const formatter = new Intl.NumberFormat('id-ID');

    let percent = 0;
    if (itemsYesterday === 0) {
      percent = itemsNow > 0 ? 100 : 0;
    } else {
      percent = Math.round(((itemsNow - itemsYesterday) / itemsYesterday) * 100);
    }

    let changeType: 'increase' | 'decrease' | 'neutral' = 'neutral';
    if (itemsNow > itemsYesterday) changeType = 'increase';
    else if (itemsNow < itemsYesterday) changeType = 'decrease';

    return {
      total: formatter.format(itemsNow),
      change: `${Math.abs(percent)}%`,
      changeType,
      previous: formatter.format(itemsYesterday),
    };
  }, [stats]);

  // Calculate category stats
  const kategoriStats = useMemo(() => {
    if (!stats) {
      return { total: '0', change: '0%', changeType: 'neutral' as const, previous: '0' };
    }

    const catsNow = stats.totalCategoriesNow || 0;
    const catsYesterday = stats.totalCategoriesYesterday || 0;
    const formatter = new Intl.NumberFormat('id-ID');

    let percent = 0;
    if (catsYesterday === 0) {
      percent = catsNow > 0 ? 100 : 0;
    } else {
      percent = Math.round(((catsNow - catsYesterday) / catsYesterday) * 100);
    }

    let changeType: 'increase' | 'decrease' | 'neutral' = 'neutral';
    if (catsNow > catsYesterday) changeType = 'increase';
    else if (catsNow < catsYesterday) changeType = 'decrease';

    return {
      total: formatter.format(catsNow),
      change: `${Math.abs(percent)}%`,
      changeType,
      previous: formatter.format(catsYesterday),
    };
  }, [stats]);

  return {
    lokerStats,
    barangStats,
    kategoriStats,
    isLoadingStats,
  };
}
