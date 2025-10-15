'use client';

import React from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

const sizeMap = {
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
};

export function Logo({
  size = 'md',
  className = '',
  showText = false,
}: LogoProps) {
  const { theme, resolvedTheme } = useTheme();

  // Determine which logo to use based on theme
  // darkLogo.svg is for light themes (dark logo on light background)
  // lightLogo.svg is for dark themes (light logo on dark background)
  const logoSrc =
    resolvedTheme === 'dark' ? '/svg/lightLogo.svg' : '/svg/darkLogo.svg';

  const logoSize = sizeMap[size];

  if (showText) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <Image
          src={logoSrc}
          alt="VIGOR Logo"
          width={logoSize}
          height={logoSize}
          className="flex-shrink-0"
          priority
        />
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-foreground">VIGOR</h1>
          <p className="text-xs text-muted-foreground">
            Hotel Management System
          </p>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={logoSrc}
      alt="VIGOR Logo"
      width={logoSize}
      height={logoSize}
      className={`flex-shrink-0 ${className}`}
      priority
    />
  );
}
