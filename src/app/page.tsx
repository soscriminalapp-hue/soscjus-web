'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { tokens } from '@/lib/tokens';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    // Decide destino com base na presença de token.
    router.replace(tokens.getAccess() ? '/dashboard' : '/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-texto-sec text-sm">
      Redirecionando…
    </div>
  );
}
