'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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

  // Debug: Log the actual data structure
  console.log('FinancialReportView received data:', data);
  console.log('Daily financial data:', dailyFinancial);
  console.log('Charts data:', charts);

  // Handle case where summary might be undefined or empty
  if (!summary || (typeof summary === 'object' && Object.keys(summary).length === 0)) {
    return <div>Summary data not available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'ETB' 
              }).format(summary.totalRevenue || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'ETB' 
              }).format(summary.totalRefunds || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'ETB' 
              }).format(summary.netRevenue || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'ETB' 
              }).format(summary.outstandingAmount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.outstandingInvoices || 0} invoices
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Status Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalInvoices || 0}</div>
            <p className="text-xs text-muted-foreground">
              {new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'ETB' 
              }).format(summary.totalInvoiceAmount || 0)} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.paidInvoices || 0}</div>
            <p className="text-xs text-muted-foreground">
              {new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'ETB' 
              }).format(summary.paidInvoiceAmount || 0)} paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.overdueInvoices || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Net Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {charts?.netRevenue ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={charts.netRevenue.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [
                    new Intl.NumberFormat('en-US', { 
                      style: 'currency', 
                      currency: 'ETB' 
                    }).format(value), 
                    'Net Revenue'
                  ]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="y" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Net Revenue (ETB)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : dailyFinancial && dailyFinancial.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyFinancial}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [
                    new Intl.NumberFormat('en-US', { 
                      style: 'currency', 
                      currency: 'ETB' 
                    }).format(value), 
                    'Net Revenue'
                  ]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="netRevenue" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Net Revenue (ETB)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data available for chart
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue by Method */}
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

