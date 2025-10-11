'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchPayments } from '@/store/slices/paymentSlice';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Filter } from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';
import type { AxiosError } from 'axios';
import { handleApiError } from '@/lib/api/error-handler';
import type { Payment } from '@/types';

// Import extracted components
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { DataTable } from '@/components/shared/DataTable';
import { StatsCard } from '@/components/shared/StatsCard';
import { DollarSign, CreditCard, CheckCircle, Clock } from 'lucide-react';

export default function PaymentsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { payments, loading } = useSelector(
    (state: RootState) => state.payment,
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { success, error } = useNotification();

  useEffect(() => {
    dispatch(fetchPayments({ page: 1, limit: 10 }));
  }, [dispatch]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800' },
      COMPLETED: { color: 'bg-green-100 text-green-800' },
      FAILED: { color: 'bg-red-100 text-red-800' },
      REFUNDED: { color: 'bg-blue-100 text-blue-800' },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
      <div
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {status}
      </div>
    );
  };

  // Calculate stats
  const stats = {
    totalPayments: payments?.length || 0,
    completedPayments:
      payments?.filter((p) => p.status === 'COMPLETED').length || 0,
    pendingPayments:
      payments?.filter((p) => p.status === 'PENDING').length || 0,
    totalAmount: payments?.reduce((sum, p) => sum + p.amount, 0) || 0,
  };

  const columns = [
    { key: 'payment', label: 'Payment', width: 'w-[200px]' },
    { key: 'reservation', label: 'Reservation', width: 'w-[150px]' },
    { key: 'amount', label: 'Amount', width: 'w-[120px]' },
    { key: 'method', label: 'Method', width: 'w-[120px]' },
    { key: 'status', label: 'Status', width: 'w-[120px]' },
    { key: 'date', label: 'Date', width: 'w-[120px]' },
  ];

  const renderPaymentRow = (payment: Payment) => (
    <tr key={payment.id} className="hover:bg-muted/50">
      <td className="px-4 py-3">
        <div>
          <div className="font-medium">#{payment.id.slice(0, 8)}</div>
          <div className="text-sm text-muted-foreground">
            {payment.reference || 'N/A'}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div>
          <div className="font-medium">
            Reservation #{payment.reservationId?.slice(0, 8) || 'N/A'}
          </div>
          <div className="text-sm text-muted-foreground">
            Guest: {payment.guestId?.slice(0, 8) || 'N/A'}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 font-medium">
        {formatCurrency(payment.amount, payment.currency)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{payment.method}</span>
        </div>
      </td>
      <td className="px-4 py-3">{getStatusBadge(payment.status)}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatDate(payment.createdAt)}
      </td>
    </tr>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Payments"
        description="Manage payment transactions and refunds"
      >
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          New Payment
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Payments"
          value={stats.totalPayments}
          description="All time"
          icon={DollarSign}
        />
        <StatsCard
          title="Completed"
          value={stats.completedPayments}
          description="Successful payments"
          icon={CheckCircle}
          className="[&>div>div>svg]:text-green-600"
        />
        <StatsCard
          title="Pending"
          value={stats.pendingPayments}
          description="Awaiting processing"
          icon={Clock}
          className="[&>div>div>svg]:text-yellow-600"
        />
        <StatsCard
          title="Total Amount"
          value={formatCurrency(stats.totalAmount, 'USD')}
          description="All time revenue"
          icon={DollarSign}
          className="[&>div>div>svg]:text-green-600"
        />
      </div>

      {/* Data Table with integrated search and filters */}
      <DataTable
        title="Payments"
        description="Manage and view all payment transactions"
        columns={columns}
        data={payments || []}
        loading={loading}
        emptyMessage="No payments found"
        searchBar={
          <SearchBar
            placeholder="Search by payment ID or transaction ID..."
            value={searchTerm}
            onChange={setSearchTerm}
            loading={false}
          />
        }
        filters={
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        }
        renderRow={renderPaymentRow}
      />
    </div>
  );
}
