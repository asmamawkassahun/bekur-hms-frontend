'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';

interface FinancialBreakdownChartProps {
  totalRevenue: number;
  totalPayments: number;
  totalCommission: number;
  netRevenue: number;
  netAfterCommission: number;
  currency?: string;
}

export function FinancialBreakdownChart({
  totalRevenue,
  totalPayments,
  totalCommission,
  netRevenue,
  netAfterCommission,
  currency = 'ETB',
}: FinancialBreakdownChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const data = [
    {
      name: 'Total Revenue',
      value: totalRevenue,
      color: 'hsl(var(--primary))',
    },
    { name: 'Payments', value: totalPayments, color: 'hsl(142, 76%, 36%)' },
    {
      name: 'Commission',
      value: totalCommission,
      color: 'hsl(var(--destructive))',
    },
    { name: 'Net Revenue', value: netRevenue, color: 'hsl(38, 92%, 50%)' },
    {
      name: 'Net After Commission',
      value: netAfterCommission,
      color: 'hsl(221, 83%, 53%)',
    },
  ];

  return (
    <Card className="bg-card border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Financial Breakdown</CardTitle>
        <CardDescription>
          Comprehensive financial summary with commission impact
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} layout="vertical" margin={{ left: 120 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-muted"
              opacity={0.3}
            />
            <XAxis
              type="number"
              className="text-xs"
              tickFormatter={formatCurrency}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Bar dataKey="value" radius={[0, 8, 8, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-muted-foreground">Commission Impact</p>
            <p className="text-lg font-semibold text-destructive">
              {formatCurrency(totalCommission)}
            </p>
            <p className="text-xs text-muted-foreground">
              {totalRevenue > 0
                ? ((totalCommission / totalRevenue) * 100).toFixed(1)
                : 0}
              % of revenue
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-muted-foreground">Final Net Amount</p>
            <p className="text-lg font-semibold text-green-600">
              {formatCurrency(netAfterCommission)}
            </p>
            <p className="text-xs text-muted-foreground">
              After all deductions
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
