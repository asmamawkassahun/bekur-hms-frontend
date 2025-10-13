'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface RevenueTrendChartProps {
  data: Array<{ date: string; amount: number; bookings: number }>;
  currency?: string;
}

export function RevenueTrendChart({
  data,
  currency = 'USD',
}: RevenueTrendChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const totalRevenue = data.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground">Revenue Trend</CardTitle>
            <CardDescription className="text-muted-foreground">
              Daily revenue performance over time
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="text-xs text-muted-foreground">Total Revenue</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9} />
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              opacity={0.5}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => {
                // Handle both month names and date strings
                if (typeof value === 'string') {
                  // If it's already a month name like 'Jan', 'Feb', return as is
                  if (value.length <= 3) {
                    return value;
                  }
                  // If it's a date string, try to parse it
                  const date = new Date(value);
                  if (!isNaN(date.getTime())) {
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }
                }
                // Fallback: return the value as string
                return String(value);
              }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                color: '#374151',
              }}
              formatter={(value, name) => [
                name === 'amount' ? formatCurrency(Number(value)) : value,
                name === 'amount' ? 'Revenue' : 'Bookings',
              ]}
              labelFormatter={(value) => {
                // Handle both month names and date strings
                if (typeof value === 'string') {
                  // If it's already a month name like 'Jan', 'Feb', return as is
                  if (value.length <= 3) {
                    return value;
                  }
                  // If it's a date string, try to parse it
                  const date = new Date(value);
                  if (!isNaN(date.getTime())) {
                    return date.toLocaleDateString();
                  }
                }
                // Fallback: return the value as string
                return String(value);
              }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#8b5cf6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              name="Revenue"
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
