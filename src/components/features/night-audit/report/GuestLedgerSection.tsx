'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { NightAudit } from '@/types/night-audit.types';

interface GuestLedgerSectionProps {
  audit: NightAudit;
  currency?: string;
}

export function GuestLedgerSection({
  audit,
  currency = 'ETB',
}: GuestLedgerSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Handle undefined/null guest ledger
  const guestLedger = audit.guestLedger || [];

  // Filter ledger entries
  const filteredLedger = guestLedger.filter((entry) => {
    const matchesSearch =
      entry.primaryGuest.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      entry.primaryGuest.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      entry.accommodation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || entry.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCharges = filteredLedger.reduce(
    (sum, entry) => sum + entry.charges.totalAmount,
    0,
  );
  const totalBalance = filteredLedger.reduce(
    (sum, entry) => sum + entry.balance,
    0,
  );
  const fullyPaidCount = filteredLedger.filter(
    (entry) => entry.balance === 0,
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Guest Ledger</h2>
        <p className="text-sm text-muted-foreground">
          Detailed transaction history for all guests with charges, payments,
          and balances
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Entries</p>
            <p className="text-2xl font-bold mt-1">{filteredLedger.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Charges</p>
            <p className="text-2xl font-bold mt-1">
              {formatCurrency(totalCharges)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Balance</p>
            <p className="text-2xl font-bold mt-1 text-amber-600">
              {formatCurrency(totalBalance)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Fully Paid</p>
            <p className="text-2xl font-bold mt-1 text-green-600">
              {fullyPaidCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <Input
              placeholder="Search by guest name, email, or accommodation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="CHECKED_IN">Checked In</SelectItem>
                <SelectItem value="CHECKED_OUT">Checked Out</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Ledger Table */}
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Guest Transactions</CardTitle>
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
                    Accommodation
                  </th>
                  <th className="text-left p-2 text-sm font-medium text-muted-foreground">
                    Check-in
                  </th>
                  <th className="text-left p-2 text-sm font-medium text-muted-foreground">
                    Check-out
                  </th>
                  <th className="text-right p-2 text-sm font-medium text-muted-foreground">
                    Charges
                  </th>
                  <th className="text-right p-2 text-sm font-medium text-muted-foreground">
                    Paid
                  </th>
                  <th className="text-right p-2 text-sm font-medium text-muted-foreground">
                    Balance
                  </th>
                  <th className="text-left p-2 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLedger.map((entry) => {
                  const totalPaid = entry.payments
                    .filter((p) => p.status === 'COMPLETED')
                    .reduce((sum, p) => sum + p.amount, 0);

                  return (
                    <tr
                      key={entry.bookingId}
                      className="border-b hover:bg-muted/30"
                    >
                      <td className="p-2 text-sm">
                        <div>
                          <p className="font-medium">
                            {entry.primaryGuest.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.primaryGuest.email}
                          </p>
                          {entry.additionalGuests &&
                            entry.additionalGuests.length > 0 && (
                              <p className="text-xs text-muted-foreground">
                                +{entry.additionalGuests.length} guest
                                {entry.additionalGuests.length > 1 ? 's' : ''}
                              </p>
                            )}
                        </div>
                      </td>
                      <td className="p-2 text-sm">{entry.accommodation}</td>
                      <td className="p-2 text-sm text-muted-foreground">
                        {new Date(entry.checkIn).toLocaleDateString()}
                      </td>
                      <td className="p-2 text-sm text-muted-foreground">
                        {new Date(entry.checkOut).toLocaleDateString()}
                      </td>
                      <td className="p-2 text-sm text-right font-medium">
                        {formatCurrency(entry.charges.totalAmount)}
                      </td>
                      <td className="p-2 text-sm text-right text-green-600">
                        {formatCurrency(totalPaid)}
                      </td>
                      <td className="p-2 text-sm text-right">
                        <span
                          className={
                            entry.balance > 0
                              ? 'text-amber-600 font-medium'
                              : 'text-green-600'
                          }
                        >
                          {formatCurrency(entry.balance)}
                        </span>
                      </td>
                      <td className="p-2 text-sm">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            entry.status === 'CHECKED_OUT'
                              ? 'bg-blue-600/10 text-blue-600'
                              : entry.status === 'CHECKED_IN'
                                ? 'bg-green-600/10 text-green-600'
                                : entry.status === 'CONFIRMED'
                                  ? 'bg-amber-600/10 text-amber-600'
                                  : entry.status === 'CANCELLED'
                                    ? 'bg-destructive/10 text-destructive'
                                    : 'bg-muted'
                          }`}
                        >
                          {entry.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 bg-muted/30 font-semibold">
                  <td colSpan={4} className="p-2 text-sm">
                    Total ({filteredLedger.length} entries)
                  </td>
                  <td className="p-2 text-sm text-right">
                    {formatCurrency(totalCharges)}
                  </td>
                  <td className="p-2 text-sm text-right text-green-600">
                    {formatCurrency(totalCharges - totalBalance)}
                  </td>
                  <td className="p-2 text-sm text-right">
                    <span
                      className={
                        totalBalance > 0 ? 'text-amber-600' : 'text-green-600'
                      }
                    >
                      {formatCurrency(totalBalance)}
                    </span>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
