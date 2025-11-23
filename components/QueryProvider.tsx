'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // No stale time - always consider data potentially stale
        staleTime: 0,
        // Cache time 5 minutes (data kept in cache for 5 min)
        gcTime: 5 * 60 * 1000,
        // Retry failed requests
        retry: 2,
        // Refetch on window focus for realtime-like experience
        refetchOnWindowFocus: true,
        // Refetch on reconnect
        refetchOnReconnect: true,
        // Always refetch on mount
        refetchOnMount: true,
      },
      mutations: {
        // Retry failed mutations
        retry: 1,
      }
    }
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
