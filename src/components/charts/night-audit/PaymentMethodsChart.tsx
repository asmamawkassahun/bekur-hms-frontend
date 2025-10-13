'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import type { PaymentBreakdown } from '@/types/night-audit.types';

interface PaymentMethodsChartProps {
  paymentBreakdown: PaymentBreakdown;
  currency?: string;
}

const COLORS = {
  CASH: 'hsl(142, 76%, 36%)',
  CARD: 'hsl(var(--primary))',
  MOBILE_MONEY: 'hsl(38, 92%, 50%)',
  BANK_TRANSFER: 'hsl(221, 83%, 53%)',
  CRYPTO: 'hsl(280, 76%, 50%)',
};

export function PaymentMethodsChart({
  paymentBreakdown,
  currency = 'ETB',
}: PaymentMethodsChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Handle undefined/null paymentBreakdown
  if (!paymentBreakdown || !paymentBreakdown.byMethod) {
    return (
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Payment Methods Distribution</CardTitle>
          <CardDescription>No payment data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            No payment breakdown data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = Object.entries(paymentBreakdown.byMethod)
    .filter(([_, amount]) => amount > 0)
    .map(([method, amount]) => ({
      name: method.replace('_', ' '),
      value: amount,
      color: COLORS[method as keyof typeof COLORS] || 'hsl(var(--muted))',
    }));

  const totalPayments = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) {
    return (
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Payment Methods Distribution</CardTitle>
          <CardDescription>No payment data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            No payments recorded for this period
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Payment Methods Distribution</CardTitle>
        <CardDescription>
          Breakdown by payment method • Total: {formatCurrency(totalPayments)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => {
                const safePercent =
                  typeof percent === 'number' && !isNaN(percent) ? percent : 0;
                return `${name}: ${(safePercent * 100).toFixed(0)}%`;
              }}
              outerRadius={100}
              innerRadius={50}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry: any) => {
                const item = data.find((d) => d.name === value);
                return `${value} (${formatCurrency(item?.value || 0)})`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          {data.map((item) => (
            <div key={item.name} className="p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <p className="text-xs text-muted-foreground">{item.name}</p>
              </div>
              <p className="text-sm font-semibold mt-1">
                {formatCurrency(item.value)}
              </p>
              <p className="text-xs text-muted-foreground">
                {((item.value / totalPayments) * 100).toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
