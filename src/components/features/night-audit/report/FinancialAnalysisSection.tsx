'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign,
  CreditCard,
  TrendingDown,
  AlertCircle,
} from 'lucide-react';
import { FinancialBreakdownChart } from '@/components/charts/night-audit/FinancialBreakdownChart';
import { PaymentMethodsChart } from '@/components/charts/night-audit/PaymentMethodsChart';
import type { NightAudit } from '@/types/night-audit.types';

interface FinancialAnalysisSectionProps {
  audit: NightAudit;
  currency?: string;
}

export function FinancialAnalysisSection({
  audit,
  currency = 'ETB',
}: FinancialAnalysisSectionProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Safe defaults for numeric fields
  const totalRevenue = Number(audit.totalRevenue) || 0;
  const roomRevenue = Number(audit.roomRevenue) || 0;
  const bedRevenue = Number(audit.bedRevenue) || 0;
  const netRevenue = Number(audit.netRevenue) || 0;
  const totalRefunds = Number(audit.totalRefunds) || 0;
  const totalCommission = Number(audit.totalCommission) || 0;
  const netAfterCommission = Number(audit.netAfterCommission) || 0;
  const outstandingBalance = Number(audit.outstandingBalance) || 0;
  const partialPayments = Number(audit.partialPayments) || 0;

  const stats = [
    {
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      description: `Room: ${formatCurrency(roomRevenue)} | Bed: ${formatCurrency(bedRevenue)}`,
      icon: DollarSign,
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Net Revenue',
      value: formatCurrency(netRevenue),
      description: `After ${formatCurrency(totalRefunds)} in refunds`,
      icon: TrendingDown,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-600/10',
    },
    {
      title: 'Commission Deducted',
      value: formatCurrency(totalCommission),
      description: `${totalRevenue > 0 ? ((totalCommission / totalRevenue) * 100).toFixed(1) : 0}% of revenue`,
      icon: AlertCircle,
      iconColor: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      title: 'Final Net Amount',
      value: formatCurrency(netAfterCommission),
      description: 'After all deductions',
      icon: DollarSign,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-600/10',
    },
    {
      title: 'Outstanding Balance',
      value: formatCurrency(outstandingBalance),
      description: `${partialPayments > 0 ? `Includes ${formatCurrency(partialPayments)} partial` : 'Unpaid amount'}`,
      icon: AlertCircle,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-600/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Financial Analysis</h2>
        <p className="text-sm text-muted-foreground">
          Comprehensive financial breakdown with revenue, payments, and
          commission analysis
        </p>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="bg-card border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Financial Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <FinancialBreakdownChart
          totalRevenue={totalRevenue}
          totalPayments={Number(audit.totalPayments) || 0}
          totalCommission={totalCommission}
          netRevenue={netRevenue}
          netAfterCommission={netAfterCommission}
          currency={currency}
        />
        {audit.paymentBreakdown && (
          <PaymentMethodsChart
            paymentBreakdown={audit.paymentBreakdown}
            currency={currency}
          />
        )}
      </div>

      {/* Payment Transactions Table */}
      {audit.paymentBreakdown?.transactions &&
        audit.paymentBreakdown.transactions.length > 0 && (
          <Card className="bg-card border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Recent Payment Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 text-sm font-medium text-muted-foreground">
                        Guest
                      </th>
                      <th className="text-left p-2 text-sm font-medium text-muted-foreground">
                        Amount
                      </th>
                      <th className="text-left p-2 text-sm font-medium text-muted-foreground">
                        Method
                      </th>
                      <th className="text-left p-2 text-sm font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left p-2 text-sm font-medium text-muted-foreground">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {audit.paymentBreakdown.transactions
                      .slice(0, 10)
                      .map((payment) => (
                        <tr
                          key={payment.id}
                          className="border-b hover:bg-muted/30"
                        >
                          <td className="p-2 text-sm">
                            {payment.guestName || 'N/A'}
                          </td>
                          <td className="p-2 text-sm font-medium">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="p-2 text-sm">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted">
                              {payment.method}
                            </span>
                          </td>
                          <td className="p-2 text-sm">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                payment.status === 'COMPLETED'
                                  ? 'bg-green-600/10 text-green-600'
                                  : payment.status === 'PENDING'
                                    ? 'bg-amber-600/10 text-amber-600'
                                    : payment.status === 'FAILED'
                                      ? 'bg-destructive/10 text-destructive'
                                      : 'bg-muted'
                              }`}
                            >
                              {payment.status}
                            </span>
                          </td>
                          <td className="p-2 text-sm text-muted-foreground">
                            {new Date(payment.date).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {audit.paymentBreakdown.transactions.length > 10 && (
                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    Showing 10 of {audit.paymentBreakdown.transactions.length}{' '}
                    transactions
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
