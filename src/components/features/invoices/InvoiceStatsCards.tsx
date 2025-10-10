import React from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import { FileText, DollarSign, CheckCircle, AlertTriangle } from 'lucide-react';

interface InvoiceStatsCardsProps {
  stats: {
    totalInvoices: number;
    totalBilled: number;
    paidCount: number;
    overdueCount: number;
  };
}

export function InvoiceStatsCards({ stats }: InvoiceStatsCardsProps) {
  const formatCurrency = (amount: number, currency: string = 'ETB') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Total Invoices"
        value={stats.totalInvoices}
        description="All invoices"
        icon={FileText}
      />
      <StatsCard
        title="Total Billed"
        value={formatCurrency(stats.totalBilled)}
        description="Sum of filtered"
        icon={DollarSign}
      />
      <StatsCard
        title="Paid"
        value={stats.paidCount}
        description="Fully/Partially paid"
        icon={CheckCircle}
      />
      <StatsCard
        title="Overdue"
        value={stats.overdueCount}
        description="Past due date"
        icon={AlertTriangle}
      />
    </div>
  );
}
