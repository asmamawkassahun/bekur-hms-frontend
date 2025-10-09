'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchProperties } from '@/store/slices/propertySlice';
import { fetchReportsSummary } from '@/store/slices/reportSlice';
import { useNotification } from '@/hooks/useNotification';
import type { AxiosError } from 'axios';
import { handleApiError } from '@/lib/api/error-handler';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { properties } = useSelector((s: RootState) => s.property);
  const { summary, loading } = useSelector((s: RootState) => s.reports);
  const { error } = useNotification();

  const [propertyId, setPropertyId] = useState('all');
  const [from, setFrom] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (!properties || properties.length === 0) {
      dispatch(fetchProperties({ page: 1, limit: 100 }));
    }
  }, [dispatch, properties]);

  useEffect(() => {
    (async () => {
      try {
        await dispatch(fetchReportsSummary({ from, to, propertyId: propertyId === 'all' ? undefined : propertyId })).unwrap();
      } catch (e) {
        const apiErr = handleApiError(e as AxiosError);
        error(apiErr.message);
      }
    })();
  }, [dispatch, propertyId, from, to, error]);

  const revenue = summary?.revenueOccupancy;
  const guests = summary?.guestAnalytics;
  const financial = summary?.financialMetrics;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Generate operational and financial reports</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Property</Label>
              <Select value={propertyId} onValueChange={setPropertyId}>
                <SelectTrigger>
                  <SelectValue placeholder="All properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>From</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(revenue?.totalRevenue || 0)}</div>
            <p className="text-sm text-muted-foreground">Occupancy: {revenue?.occupancyRate ?? 0}%</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Guests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{guests?.totalGuests || 0}</div>
            <p className="text-sm text-muted-foreground">New: {guests?.newGuests || 0} • Active: {guests?.activeGuests || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Financial</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Payments: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(financial?.totalPayments || 0)}</p>
            <p className="text-sm text-muted-foreground">Refunds: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(financial?.totalRefunds || 0)}</p>
            <p className="text-sm text-muted-foreground">Net: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(financial?.netRevenue || 0)}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
