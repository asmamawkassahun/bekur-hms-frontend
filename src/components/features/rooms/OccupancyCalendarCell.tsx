'use client';

import React from 'react';
import { format } from 'date-fns';
import { DailyOccupancy } from '@/types/room.types';
import { cn } from '@/lib/utils';
import { Bed, TrendingUp } from 'lucide-react';

interface OccupancyCalendarCellProps {
  data: DailyOccupancy | null;
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  onClick: (data: DailyOccupancy | null, date: Date) => void;
}

export function OccupancyCalendarCell({
  data,
  date,
  isCurrentMonth,
  isToday,
  onClick,
}: OccupancyCalendarCellProps) {
  const getOccupancyColorClass = (occupancyRate: number) => {
    if (occupancyRate >= 80) return 'text-destructive';
    if (occupancyRate >= 60) return 'text-orange-600';
    return 'text-green-600';
  };

  const getOccupancyBgClass = (occupancyRate: number) => {
    if (occupancyRate >= 80) return 'bg-destructive/5';
    if (occupancyRate >= 60) return 'bg-orange-50 dark:bg-orange-950/20';
    return 'bg-green-50 dark:bg-green-950/20';
  };

  const handleClick = () => {
    onClick(data, date);
  };

  return (
    <div
      className={cn(
        'relative h-28 p-2 cursor-pointer transition-all hover:bg-accent/50',
        'flex flex-col gap-2',
        isCurrentMonth ? 'bg-transparent' : 'bg-muted/30 text-muted-foreground',
        isToday && 'ring-2 ring-primary ring-inset',
        !isCurrentMonth && 'opacity-40',
      )}
      onClick={handleClick}
    >
      {/* Date */}
      <div
        className={cn(
          'text-xs font-medium',
          isToday && 'text-primary font-semibold',
        )}
      >
        {format(date, 'd')}
      </div>

      {/* Occupancy Stats */}
      {data && isCurrentMonth && (
        <div className="flex-1 flex flex-col justify-center gap-1.5">
          {/* Occupancy Rate Card */}
          <div
            className={cn(
              'flex items-center gap-1.5 rounded px-1.5 py-1',
              getOccupancyBgClass(data.occupancyRate),
            )}
          >
            <TrendingUp
              className={cn(
                'h-3 w-3',
                getOccupancyColorClass(data.occupancyRate),
              )}
            />
            <span
              className={cn(
                'text-xs font-semibold',
                getOccupancyColorClass(data.occupancyRate),
              )}
            >
              {data.occupancyRate.toFixed(0)}%
            </span>
          </div>

          {/* Room Count */}
          <div className="flex items-center gap-1.5 rounded bg-muted/50 px-1.5 py-0.5">
            <Bed className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {data.occupiedRooms}/{data.totalRooms}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
