'use client';

import React from 'react';
import { format } from 'date-fns';
import { DailyOccupancy } from '@/types/room.types';
import { cn } from '@/lib/utils';

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
  const getOccupancyColor = (occupancyRate: number) => {
    if (occupancyRate <= 40) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200';
    } else if (occupancyRate <= 70) {
      return 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200';
    } else {
      return 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200';
    }
  };

  const handleClick = () => {
    onClick(data, date);
  };

  return (
    <div
      className={cn(
        'relative h-20 p-2 border rounded-lg cursor-pointer transition-colors',
        'flex flex-col justify-between',
        isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400',
        isToday && 'ring-2 ring-blue-500 ring-opacity-50',
        data && getOccupancyColor(data.occupancyRate),
        !isCurrentMonth && 'opacity-50'
      )}
      onClick={handleClick}
    >
      <div className="text-sm font-medium">
        {format(date, 'd')}
      </div>
      
      {data && isCurrentMonth && (
        <div className="text-xs font-semibold">
          {data.occupancyRate.toFixed(0)}%
        </div>
      )}
      
      {data && isCurrentMonth && (
        <div className="text-xs text-gray-600">
          {data.occupiedRooms}/{data.totalRooms}
        </div>
      )}
    </div>
  );
}

