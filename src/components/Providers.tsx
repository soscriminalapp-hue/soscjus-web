'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useRef, type ReactNode } from 'react';
import { useAuth } from '@/store/auth';

export function Providers({ children }: { children: ReactNode }) {
  // Um QueryClient por sessão de app (não recria a cada render).
  const clientRef = useRef<QueryClient | null>(null);
  if (clientRef.current === null) {
    clientRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 1,
          refetchOnWindowFocus: false,
          staleTime: 30_000,
        },
      },
    });
  }
  // Const local estreita o tipo (QueryClient, sem null) pro provider.
  const queryClient = clientRef.current;

  const hydrate = useAuth((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
