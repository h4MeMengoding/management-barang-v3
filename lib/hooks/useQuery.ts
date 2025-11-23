import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser } from '@/lib/auth';

// ============================================
// TYPE DEFINITIONS
// ============================================
interface Category {
  id: string;
  name: string;
  createdAt: string;
  totalQuantity?: number;
}

interface Locker {
  id: string;
  name: string;
  code: string;
  createdAt: string;
}

interface Item {
  id: string;
  name: string;
  quantity: number;
  description: string | null;
  categoryId: string;
  lockerId: string;
  category: Category;
  locker: Locker;
  createdAt: string;
}

interface CreateItemData {
  name: string;
  categoryId: string;
  quantity: number;
  lockerId: string;
  description?: string | null;
}

interface UpdateItemData extends CreateItemData {
  id: string;
}

// ============================================
// QUERY KEYS
// ============================================
export const queryKeys = {
  items: (userId?: string) => ['items', userId] as const,
  item: (id: string) => ['items', id] as const,
  lockers: (userId?: string) => ['lockers', userId] as const,
  locker: (id: string) => ['lockers', id] as const,
  categories: (userId?: string) => ['categories', userId] as const,
  stats: (userId?: string) => ['stats', userId] as const,
};

// ============================================
// ITEMS HOOKS
// ============================================

/**
 * Fetch all items for current user
 */
export function useItems() {
  const user = getCurrentUser();
  
  return useQuery({
    queryKey: queryKeys.items(user?.id),
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const response = await fetch(`/api/items?userId=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      const data = await response.json();
      return data.items as Item[];
    },
    enabled: !!user,
    // Refetch every 30 seconds for semi-realtime
    refetchInterval: 30000,
  });
}

/**
 * Fetch single item by ID
 */
export function useItem(itemId: string | null) {
  const user = getCurrentUser();
  
  return useQuery({
    queryKey: queryKeys.item(itemId || ''),
    queryFn: async () => {
      if (!user || !itemId) throw new Error('Missing user or itemId');
      
      const response = await fetch(`/api/items?id=${itemId}&userId=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch item');
      }
      const data = await response.json();
      return data.item as Item;
    },
    enabled: !!user && !!itemId,
  });
}

/**
 * Create new item mutation
 */
export function useCreateItem() {
  const queryClient = useQueryClient();
  const user = getCurrentUser();
  
  return useMutation({
    mutationFn: async (data: CreateItemData) => {
      if (!user) throw new Error('User not authenticated');
      
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          userId: user.id,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create item');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate items query to refetch data
      queryClient.invalidateQueries({ queryKey: queryKeys.items(user?.id) });
      // Also invalidate stats
      queryClient.invalidateQueries({ queryKey: queryKeys.stats(user?.id) });
    },
  });
}

/**
 * Update item mutation
 */
export function useUpdateItem() {
  const queryClient = useQueryClient();
  const user = getCurrentUser();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateItemData) => {
      if (!user) throw new Error('User not authenticated');
      
      const response = await fetch(`/api/items?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          userId: user.id,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update item');
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate specific item
      queryClient.invalidateQueries({ queryKey: queryKeys.item(variables.id) });
      // Invalidate all items
      queryClient.invalidateQueries({ queryKey: queryKeys.items(user?.id) });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: queryKeys.stats(user?.id) });
    },
  });
}

/**
 * Delete item mutation
 */
export function useDeleteItem() {
  const queryClient = useQueryClient();
  const user = getCurrentUser();
  
  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const response = await fetch(`/api/items?id=${itemId}&userId=${user.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete item');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate items query
      queryClient.invalidateQueries({ queryKey: queryKeys.items(user?.id) });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: queryKeys.stats(user?.id) });
    },
  });
}

// ============================================
// LOCKERS HOOKS
// ============================================

/**
 * Fetch all lockers
 */
export function useLockers() {
  const user = getCurrentUser();
  
  return useQuery({
    queryKey: queryKeys.lockers(user?.id),
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const response = await fetch(`/api/lockers?userId=${user.id}`, {
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch lockers');
      }
      const data = await response.json();
      return data.lockers as Locker[];
    },
    enabled: !!user,
    // Remove staleTime to always consider data potentially stale
    staleTime: 0,
    // Refetch on window focus
    refetchOnWindowFocus: true,
    // Refetch on mount
    refetchOnMount: true,
  });
}

/**
 * Fetch single locker with items
 */
export function useLocker(lockerId: string | null) {
  const user = getCurrentUser();
  
  return useQuery({
    queryKey: queryKeys.locker(lockerId || ''),
    queryFn: async () => {
      if (!user || !lockerId) throw new Error('Missing user or lockerId');
      
      const response = await fetch(`/api/lockers?id=${lockerId}&userId=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch locker');
      }
      const data = await response.json();
      return data.locker;
    },
    enabled: !!user && !!lockerId,
    refetchInterval: 30000,
  });
}

// ============================================
// CATEGORIES HOOKS
// ============================================

/**
 * Fetch all categories
 */
export function useCategories() {
  const user = getCurrentUser();
  
  return useQuery({
    queryKey: queryKeys.categories(user?.id),
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const response = await fetch(`/api/categories?userId=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      return data.categories as Category[];
    },
    enabled: !!user,
  });
}

// ============================================
// STATS HOOKS
// ============================================

/**
 * Fetch dashboard stats
 */
export function useStats() {
  const user = getCurrentUser();
  
  return useQuery({
    queryKey: queryKeys.stats(user?.id),
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const response = await fetch(`/api/stats?userId=${user.id}`, {
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      return response.json();
    },
    enabled: !!user,
    // Remove staleTime to always consider data potentially stale
    staleTime: 0,
    // Refetch on window focus
    refetchOnWindowFocus: true,
    // Refetch on mount
    refetchOnMount: true,
  });
}
