import { ThemeConfig } from '@/types';

export const themeConfig: ThemeConfig = {
  brand: {
    name: process.env.NEXT_PUBLIC_BRAND_NAME || 'Bekur HMS',
    logo: process.env.NEXT_PUBLIC_BRAND_LOGO || '/logo.svg',
  },
  colors: {
    primary: process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#0070f3',
    secondary: process.env.NEXT_PUBLIC_SECONDARY_COLOR || '#7928ca',
    accent: process.env.NEXT_PUBLIC_ACCENT_COLOR || '#ff0080',
    background: process.env.NEXT_PUBLIC_BG_COLOR || '#ffffff',
    foreground: process.env.NEXT_PUBLIC_FG_COLOR || '#000000',
  },
  typography: {
    fontFamily: process.env.NEXT_PUBLIC_FONT_FAMILY || 'Inter',
    fontSize: {
      base: process.env.NEXT_PUBLIC_FONT_SIZE_BASE || '16px',
      heading: process.env.NEXT_PUBLIC_FONT_SIZE_HEADING || '24px',
    },
  },
  spacing: {
    unit: process.env.NEXT_PUBLIC_SPACING_UNIT || '4px',
  },
  borderRadius: {
    sm: process.env.NEXT_PUBLIC_RADIUS_SM || '4px',
    md: process.env.NEXT_PUBLIC_RADIUS_MD || '8px',
    lg: process.env.NEXT_PUBLIC_RADIUS_LG || '12px',
  },
};

// CSS Variables for dynamic theming
export const getCSSVariables = () => ({
  '--brand-name': `"${themeConfig.brand.name}"`,
  '--brand-logo': `url("${themeConfig.brand.logo}")`,
  '--color-primary': themeConfig.colors.primary,
  '--color-secondary': themeConfig.colors.secondary,
  '--color-accent': themeConfig.colors.accent,
  '--color-background': themeConfig.colors.background,
  '--color-foreground': themeConfig.colors.foreground,
  '--font-family': themeConfig.typography.fontFamily,
  '--font-size-base': themeConfig.typography.fontSize.base,
  '--font-size-heading': themeConfig.typography.fontSize.heading,
  '--spacing-unit': themeConfig.spacing.unit,
  '--radius-sm': themeConfig.borderRadius.sm,
  '--radius-md': themeConfig.borderRadius.md,
  '--radius-lg': themeConfig.borderRadius.lg,
});

// Theme validation
export const validateThemeConfig = (): boolean => {
  const requiredFields = [
    'NEXT_PUBLIC_BRAND_NAME',
    'NEXT_PUBLIC_PRIMARY_COLOR',
    'NEXT_PUBLIC_SECONDARY_COLOR',
  ];

  return requiredFields.every((field) => process.env[field]);
};

// Get theme color by name
export const getThemeColor = (
  colorName: keyof ThemeConfig['colors'],
): string => {
  return themeConfig.colors[colorName];
};

// Get theme spacing
export const getThemeSpacing = (multiplier: number = 1): string => {
  const unit = parseInt(themeConfig.spacing.unit.replace('px', ''));
  return `${unit * multiplier}px`;
};

// Get theme border radius
export const getThemeRadius = (size: 'sm' | 'md' | 'lg'): string => {
  return themeConfig.borderRadius[size];
};
