import { createClient } from '@supabase/supabase-js';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getCurrentUser } from '@/lib/auth';
import { queryKeys } from './useQuery';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// REALTIME HOOKS
// ============================================

/**
 * Subscribe to Items table changes
 * Automatically invalidates queries when data changes
 */
export function useItemsRealtime() {
  const queryClient = useQueryClient();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) return;

    // Subscribe to INSERT, UPDATE, DELETE events on Item table
    const channel = supabase
      .channel('items-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'Item',
          filter: `userId=eq.${user.id}`,
        },
        (payload) => {
          console.log('Items realtime update:', payload);
          
          // Invalidate items query to trigger refetch
          queryClient.invalidateQueries({ 
            queryKey: queryKeys.items(user.id) 
          });
          
          // Also invalidate stats
          queryClient.invalidateQueries({ 
            queryKey: queryKeys.stats(user.id) 
          });
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}

/**
 * Subscribe to Locker table changes
 */
export function useLockersRealtime() {
  const queryClient = useQueryClient();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('lockers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Locker',
          filter: `userId=eq.${user.id}`,
        },
        (payload) => {
          console.log('Lockers realtime update:', payload);
          
          // Invalidate lockers query
          queryClient.invalidateQueries({ 
            queryKey: queryKeys.lockers(user.id) 
          });
          
          // If specific locker changed, invalidate that too
          if (payload.new && 'id' in payload.new) {
            queryClient.invalidateQueries({ 
              queryKey: queryKeys.locker(payload.new.id as string) 
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}

/**
 * Subscribe to specific locker changes (for detail page)
 */
export function useLockerRealtime(lockerId: string | null) {
  const queryClient = useQueryClient();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user || !lockerId) return;

    // Subscribe to locker changes
    const lockerChannel = supabase
      .channel(`locker-${lockerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Locker',
          filter: `id=eq.${lockerId}`,
        },
        (payload) => {
          console.log('Locker detail update:', payload);
          queryClient.invalidateQueries({ 
            queryKey: queryKeys.locker(lockerId) 
          });
        }
      )
      .subscribe();

    // Also subscribe to items in this locker
    const itemsChannel = supabase
      .channel(`locker-items-${lockerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Item',
          filter: `lockerId=eq.${lockerId}`,
        },
        (payload) => {
          console.log('Locker items update:', payload);
          queryClient.invalidateQueries({ 
            queryKey: queryKeys.locker(lockerId) 
          });
          queryClient.invalidateQueries({ 
            queryKey: queryKeys.items(user.id) 
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(lockerChannel);
      supabase.removeChannel(itemsChannel);
    };
  }, [user, lockerId, queryClient]);
}
