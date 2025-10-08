'use client';

import React, { useEffect } from 'react';
import { getCSSVariables } from './config';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    // Inject CSS variables into the document root
    const cssVariables = getCSSVariables();
    const root = document.documentElement;

    Object.entries(cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }, []);

  return <>{children}</>;
}
