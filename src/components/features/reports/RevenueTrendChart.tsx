'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ChartData } from '@/types/report.types';

interface RevenueTrendChartProps {
  data: ChartData;
}

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  if (!data || !Array.isArray(data.data) || data.data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No data available for chart
      </div>
    );
  }

  // Filter out invalid data points
  const validData = data.data.filter(item => 
    typeof item.y === 'number' && !isNaN(item.y) && item.y >= 0
  );

  if (validData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No valid data available for chart
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={validData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="x" />
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
        <Line 
          type="monotone" 
          dataKey="y" 
          stroke="#10b981" 
          strokeWidth={2}
          name="Revenue (ETB)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

