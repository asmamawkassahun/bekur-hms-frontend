'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import type { ChartData } from '@/types/report.types';

interface RevenueByMethodChartProps {
  data: ChartData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function RevenueByMethodChart({ data }: RevenueByMethodChartProps) {
  if (!data || !Array.isArray(data.data) || data.data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No data available for chart
      </div>
    );
  }

  // Filter out invalid data points and ensure values are numbers
  // Handle both data formats: { x, y } and { name, value }
  const validData = data.data
    .map((item) => {
      // Check if item has 'value' property (format: { name, value })
      if ('value' in item) {
        return {
          name: item.name,
          value:
            typeof item.value === 'number'
              ? item.value
              : Number(item.value) || 0,
        };
      }
      // Otherwise it has 'x' and 'y' properties (format: { x, y })
      return {
        name: item.x,
        value: typeof item.y === 'number' ? item.y : Number(item.y) || 0,
      };
    })
    .filter((item) => item.value > 0);

  if (validData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No valid data available for chart
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={validData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(props: any) =>
            `${props.name} ${(props.percent * 100).toFixed(0)}%`
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {validData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [
            new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'ETB',
            }).format(value),
            'Amount',
          ]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
