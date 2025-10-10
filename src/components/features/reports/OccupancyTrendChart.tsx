'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ChartData } from '@/types/report.types';

interface OccupancyTrendChartProps {
  data: ChartData;
}

export function OccupancyTrendChart({ data }: OccupancyTrendChartProps) {
  if (!data || !Array.isArray(data.data)) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No data available for chart
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data.data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="x" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="y" 
          stroke="#8884d8" 
          strokeWidth={2}
          name="Occupancy Rate (%)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

