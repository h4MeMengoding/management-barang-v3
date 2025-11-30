import useSWR from 'swr';
import { getCurrentUser } from '@/lib/auth';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useItems() {
  const user = getCurrentUser();
  const userId = user?.id;

  const { data, error, isLoading, mutate } = useSWR(
    userId ? `/api/items?userId=${userId}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 0, // Disable auto-refresh, only manual or on focus
    }
  );

  return {
    items: data?.items || [],
    isLoading,
    isError: error,
    mutate, // Use this to manually refresh data after mutations
  };
}

export function useLockers() {
  const user = getCurrentUser();
  const userId = user?.id;

  const { data, error, isLoading, mutate } = useSWR(
    userId ? `/api/lockers?userId=${userId}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    lockers: data?.lockers || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useCategories() {
  const user = getCurrentUser();
  const userId = user?.id;

  const { data, error, isLoading, mutate } = useSWR(
    userId ? `/api/categories?userId=${userId}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    categories: data?.categories || [],
    isLoading,
    isError: error,
    mutate,
  };
}

// Bulk operations for items
export async function bulkDeleteItems(itemIds: string[], userId: string) {
  const response = await fetch(`/api/items?ids=${itemIds.join(',')}&userId=${userId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to delete items');
  }

  return response.json();
}

export async function bulkMoveItems(
  itemIds: string[],
  userId: string,
  categoryId?: string,
  lockerId?: string
) {
  const response = await fetch('/api/items?bulkMoveItems=true', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      itemIds,
      userId,
      categoryId,
      lockerId,
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to move items');
  }

  return response.json();
}
