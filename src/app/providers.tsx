'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ThemeProvider as NextThemesProvider } from '@/components/providers/theme-provider';
import { ThemeProvider } from '@/lib/theme/provider';
import { Toaster } from '@/components/ui/sonner';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </NextThemesProvider>
    </Provider>
  );
}
