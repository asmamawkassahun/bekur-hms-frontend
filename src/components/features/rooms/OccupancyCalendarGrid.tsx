'use client';

import React from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addDays,
  subDays,
} from 'date-fns';
import { DailyOccupancy } from '@/types/room.types';
import { OccupancyCalendarCell } from './OccupancyCalendarCell';

interface OccupancyCalendarGridProps {
  data: DailyOccupancy[];
  year: number;
  month: number;
  onCellClick: (data: DailyOccupancy | null, date: Date) => void;
}

export function OccupancyCalendarGrid({
  data,
  year,
  month,
  onCellClick,
}: OccupancyCalendarGridProps) {
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(new Date(year, month - 1));

  // Get the first day of the week for the month (0 = Sunday)
  const startDayOfWeek = getDay(monthStart);

  // Calculate the start date for the calendar grid (including previous month's trailing days)
  const calendarStart = subDays(monthStart, startDayOfWeek);

  // Calculate the end date for the calendar grid (including next month's leading days)
  const calendarEnd = addDays(monthEnd, 6 - getDay(monthEnd));

  // Generate all days for the calendar grid
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  // Create a map of date strings to occupancy data for quick lookup
  const occupancyMap = new Map(data.map((item) => [item.date, item]));

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
      {/* Calendar Header */}
      <div className="grid grid-cols-7 bg-muted/50 border-b">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-medium text-foreground border-r last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((date, index) => {
          const dateString = format(date, 'yyyy-MM-dd');
          const occupancyData = occupancyMap.get(dateString) || null;
          const isCurrentMonth = date.getMonth() === month - 1;
          const isToday =
            format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

          return (
            <div key={index} className="border-r border-b last:border-r-0">
              <OccupancyCalendarCell
                data={occupancyData}
                date={date}
                isCurrentMonth={isCurrentMonth}
                isToday={isToday}
                onClick={onCellClick}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
