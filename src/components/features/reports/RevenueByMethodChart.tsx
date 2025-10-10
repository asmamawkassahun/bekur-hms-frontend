'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { ChartData } from '@/types/report.types';

interface RevenueByMethodChartProps {
  data: ChartData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function RevenueByMethodChart({ data }: RevenueByMethodChartProps) {
  if (!data || !Array.isArray(data.data)) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No data available for chart
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data.data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => [
            new Intl.NumberFormat('en-US', { 
              style: 'currency', 
              currency: 'ETB' 
            }).format(value), 
            'Amount'
          ]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

