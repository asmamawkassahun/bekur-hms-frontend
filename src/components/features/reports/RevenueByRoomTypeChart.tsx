'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ChartData } from '@/types/report.types';

interface RevenueByRoomTypeChartProps {
  data: ChartData;
}

export function RevenueByRoomTypeChart({ data }: RevenueByRoomTypeChartProps) {
  if (!data || !Array.isArray(data.data) || data.data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No data available for chart
      </div>
    );
  }

  // Filter out invalid data points and ensure values are numbers
  const validData = data.data
    .map(item => ({
      ...item,
      value: typeof item.value === 'number' ? item.value : (Number(item.value) || 0)
    }))
    .filter(item => item.value > 0);

  if (validData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No valid data available for chart
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={validData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          formatter={(value: number) => [
            new Intl.NumberFormat('en-US', { 
              style: 'currency', 
              currency: 'ETB' 
            }).format(value), 
            'Revenue'
          ]}
        />
        <Legend />
        <Bar dataKey="value" fill="#3b82f6" name="Revenue (ETB)" />
      </BarChart>
    </ResponsiveContainer>
  );
}

