'use client';

import { useEffect } from 'react';
import { ToastProvider } from '@/components/ui/Toast';
import { useTheme } from '@/store/theme';

/** Client-side providers: theme hydration + toast portal. */
export function Providers({ children }: { children: React.ReactNode }) {
  const hydrate = useTheme((s) => s.hydrate);
  useEffect(() => hydrate(), [hydrate]);
  return <ToastProvider>{children}</ToastProvider>;
}
