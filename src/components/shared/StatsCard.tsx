import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

type GradientVariant = 'violet' | 'blue' | 'green' | 'yellow' | 'rose' | 'none';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  className?: string;
  gradient?: GradientVariant;
}

const gradientStyles: Record<GradientVariant, { card: string; icon: string; iconText: string }> = {
  violet: {
    card: 'bg-gradient-to-br from-violet-500/20 via-violet-400/10 to-transparent border border-violet-300/30 backdrop-blur-sm shadow-lg',
    icon: 'bg-violet-500/20',
    iconText: 'text-violet-600 dark:text-violet-400',
  },
  blue: {
    card: 'bg-gradient-to-br from-blue-500/20 via-blue-400/10 to-transparent border border-blue-300/30 backdrop-blur-sm shadow-lg',
    icon: 'bg-blue-500/20',
    iconText: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    card: 'bg-gradient-to-br from-emerald-500/20 via-emerald-400/10 to-transparent border border-emerald-300/30 backdrop-blur-sm shadow-lg',
    icon: 'bg-emerald-500/20',
    iconText: 'text-emerald-600 dark:text-emerald-400',
  },
  yellow: {
    card: 'bg-gradient-to-br from-amber-500/20 via-amber-400/10 to-transparent border border-amber-300/30 backdrop-blur-sm shadow-lg',
    icon: 'bg-amber-500/20',
    iconText: 'text-amber-600 dark:text-amber-400',
  },
  rose: {
    card: 'bg-gradient-to-br from-rose-500/20 via-rose-400/10 to-transparent border border-rose-300/30 backdrop-blur-sm shadow-lg',
    icon: 'bg-rose-500/20',
    iconText: 'text-rose-600 dark:text-rose-400',
  },
  none: {
    card: 'bg-card border border-border shadow-sm',
    icon: 'bg-muted',
    iconText: 'text-muted-foreground',
  },
};

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className = '',
  gradient = 'none',
}: StatsCardProps) {
  const styles = gradientStyles[gradient];

  return (
    <Card className={`${styles.card} ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`h-10 w-10 rounded-full ${styles.icon} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${styles.iconText}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        {trend && (
          <div className="flex items-center mt-2">
            {trend.isPositive ? (
              <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400 mr-1" />
            )}
            <span
              className={`text-sm font-semibold ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </span>
            {trend.label && (
              <span className="text-sm text-muted-foreground ml-2">
                {trend.label}
              </span>
            )}
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
