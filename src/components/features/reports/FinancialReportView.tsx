'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/shared/StatsCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, CreditCard, Receipt } from 'lucide-react';
import type { FinancialReportData } from '@/types/report.types';

interface FinancialReportViewProps {
  data: FinancialReportData;
}

export function FinancialReportView({ data }: FinancialReportViewProps) {
  // Handle case where data might be undefined or have different structure
  if (!data) {
    return <div>No data available</div>;
  }

  // Handle different possible data structures
  const summary = data.summary || data;
  const revenueByMethod = data.revenueByMethod || [];
  const dailyFinancial = data.dailyFinancial || [];
  const charts = data.charts || {};

  // Handle case where summary might be undefined or empty
  if (!summary || (typeof summary === 'object' && Object.keys(summary).length === 0)) {
    return <div>Summary data not available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'ETB'
          }).format(summary.totalRevenue || 0)}
          icon={DollarSign}
          gradient="green"
        />

        <StatsCard
          title="Total Refunds"
          value={new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'ETB'
          }).format(summary.totalRefunds || 0)}
          icon={TrendingUp}
          gradient="rose"
        />

        <StatsCard
          title="Net Revenue"
          value={new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'ETB'
          }).format(summary.netRevenue || 0)}
          icon={CreditCard}
          gradient="blue"
        />

        <StatsCard
          title="Outstanding Invoices"
          value={summary.outstandingInvoices || 0}
          icon={Receipt}
          gradient="yellow"
        />
      </div>

      {/* Financial Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyFinancial}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
              <Line type="monotone" dataKey="expenses" stroke="#82ca9d" name="Expenses" />
              <Line type="monotone" dataKey="profit" stroke="#ffc658" name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue by Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {revenueByMethod.map((method, index) => (
              <div key={index} className="flex justify-between items-center p-2 border rounded">
                <span className="font-medium">{method.method}</span>
                <div className="text-right">
                  <div className="font-bold">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'ETB'
                    }).format(method.amount)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {method.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}