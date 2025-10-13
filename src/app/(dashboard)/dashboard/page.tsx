'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  fetchDashboardOverview,
  setSelectedPeriod,
  setSelectedProperty,
} from '@/store/slices/dashboardSlice';
import { fetchProperties } from '@/store/slices/propertySlice';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Bed,
  RefreshCw,
} from 'lucide-react';

// Import components
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { DashboardSkeleton } from '@/components/skeletons';
import { RevenueTrendChart } from '@/components/charts/RevenueTrendChart';
import { OccupancyTrendChart } from '@/components/charts/OccupancyTrendChart';
import { RevenueByRoomTypeChart } from '@/components/charts/RevenueByRoomTypeChart';
import { BookingStatusChart } from '@/components/charts/BookingStatusChart';
import { GuestDemographicsChart } from '@/components/charts/GuestDemographicsChart';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivities } from '@/components/dashboard/RecentActivities';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';


export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { overview, loading, selectedPeriod, selectedPropertyId } = useSelector(
    (state: RootState) => state.dashboard,
  );
  const { properties } = useSelector((state: RootState) => state.property);

  console.log("properties: ", properties);
  console.log("overview: ", overview);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastFetchParams, setLastFetchParams] = useState<string>('');

  // Fetch properties on mount only
  useEffect(() => {
    dispatch(fetchProperties({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Fetch dashboard data when period or property changes
  useEffect(() => {
    const params = JSON.stringify({ selectedPropertyId, selectedPeriod });

    // Prevent duplicate fetches with same parameters
    if (params !== lastFetchParams) {
      dispatch(
        fetchDashboardOverview({
          propertyId: selectedPropertyId || undefined,
          period: (selectedPeriod || 'MONTH').toLowerCase() as any,
        }),
      );
      setLastFetchParams(params);
    }
  }, [dispatch, selectedPropertyId, selectedPeriod, lastFetchParams]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    dispatch(
      fetchDashboardOverview({
        propertyId: selectedPropertyId || undefined,
        period: (selectedPeriod || 'MONTH').toLowerCase() as any,
      }),
    );
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handlePeriodChange = (period: string) => {
    dispatch(
      setSelectedPeriod(
        period as 'today' | 'week' | 'month' | 'quarter' | 'year',
      ),
    );
  };

  const handlePropertyChange = (propertyId: string) => {
    dispatch(setSelectedProperty(propertyId === 'all' ? null : propertyId));
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // KPIs: always use backend when available, fallback to zeros (not dummy)
  const kpis = useMemo(() => {
    return (
      overview?.kpis || {
        occupancy: {
          rooms: { occupied: 0, available: 0, total: 0, rate: 0 },
          beds: { occupied: 0, available: 0, total: 0, rate: 0 },
        },
        revenue: { today: 0, thisWeek: 0, thisMonth: 0, currency: 'ETB' },
        operations: {
          pendingCheckIns: 0,
          pendingCheckOuts: 0,
          pendingPayments: 0,
        },
        availability: { availableRooms: 0, availableBeds: 0 },
      }
    );
  }, [overview]);

  console.log("kpis: ", kpis);
  console.log("overview: ", overview);

  // Transform API data to match chart expectations
  const trends = useMemo(() => {
    return {
      occupancy:
        overview?.trends?.occupancy?.map((item: any) => ({
          date: item.date,
          rooms: item.rooms || item.occupancy || 0,
          beds: item.beds || Math.round((item.occupancy || 0) * 0.9),
        })) || [],
      revenue:
        overview?.trends?.revenue?.map((item: any) => ({
          date: item.date,
          amount: Number(item.amount ?? item.revenue ?? 0) || 0,
          bookings: 0,
        })) || [],
    };
  }, [overview]);

  // Derive booking status dataset from available API fields
  const bookingStatusData = useMemo(() => {
    const totalBookings = (overview?.trends?.bookings || []).reduce(
      (sum: number, item: any) => sum + (Number(item.bookings) || 0),
      0,
    );
    return [
      { status: 'Confirmed', count: totalBookings, fill: '#34d399' },
      {
        status: 'Pending',
        count: overview?.kpis?.operations?.pendingCheckIns || 0,
        fill: '#fbbf24',
      },
      {
        status: 'Checked In',
        count: overview?.kpis?.occupancy?.rooms?.occupied || 0,
        fill: '#60a5fa',
      },
      {
        status: 'Checked Out',
        count: overview?.kpis?.operations?.pendingCheckOuts || 0,
        fill: '#a78bfa',
      },
      { status: 'Cancelled', count: 0, fill: '#f87171' },
    ];
  }, [overview]);

  // Calculate total revenue from trends for the selected period
  const totalRevenue = useMemo(() => {
    return (
      (overview?.trends?.revenue || []).reduce(
        (sum: number, item: any) => sum + (Number(item.amount ?? item.revenue) || 0),
        0,
      ) || 0
    );
  }, [overview]);

  // Transform recent activities to match expected format
  const recentActivities = useMemo(() => {
    return (
      overview?.recentActivities?.map((activity: any) => ({
        id: activity.id,
        type: activity.type,
        description: `${activity.guestName} ${activity.action} - ${activity.roomInfo}`,
        timestamp: activity.timestamp,
        user: activity.guestName,
      })) || []
    );
  }, [overview]);

  const alerts = useMemo(() => {
    return overview?.alerts || [];
  }, [overview]);

  // Transform guest data to match expected format
  const guestData = useMemo(() => {
    return {
      byNationality:
        overview?.guestData?.byNationality?.map((item: any) => ({
          country: item.nationality,
          guests: item.count,
        })) || [],
      byLoyaltyTier: overview?.guestData?.byLoyaltyTier || [],
    };
  }, [overview]);

  // Transform revenue data to match expected format
  const revenueData = useMemo(() => {
    return {
      byRoomType:
        overview?.revenueData?.byRoomType
          ?.reduce((acc: any[], item: any) => {
            const existing = acc.find((r) => r.name === item.type);
            if (existing) {
              existing.amount += Number(item.amount);
            } else {
              acc.push({
                name: item.type,
                amount: Number(item.amount),
                percentage: 0,
                fill: '#a78bfa',
              });
            }
            return acc;
          }, [])
          .map((item: any, index: number) => ({
            ...item,
            percentage: totalRevenue
              ? Math.round((item.amount / totalRevenue) * 100)
              : 0,
            fill: ['#a78bfa', '#60a5fa', '#fbbf24', '#f472b6'][index % 4],
          })) || [],
      byPaymentMethod: overview?.revenueData?.byPaymentMethod || [],
    };
  }, [overview, totalRevenue]);

  // Show skeleton during initial loading (after all hooks)
  if (loading && !overview) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Period Selector and Property Filter */}
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user?.firstName || 'User'}! Here's your hotel performance overview.`}
      >
        <div className="flex items-center gap-3">
          {/* Property Filter */}
          <Select
            value={selectedPropertyId || 'all'}
            onValueChange={handlePropertyChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Period Selector */}
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODAY">Today</SelectItem>
              <SelectItem value="WEEK">This Week</SelectItem>
              <SelectItem value="MONTH">This Month</SelectItem>
              <SelectItem value="QUARTER">This Quarter</SelectItem>
              <SelectItem value="YEAR">This Year</SelectItem>
            </SelectContent>
          </Select>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="cursor-pointer"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
      </PageHeader>

      {/* Primary KPIs */}
      <div className="grid gap-4 lg:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Room Occupancy"
          value={`${kpis.occupancy.rooms.rate.toFixed(1)}%`}
          description={`${kpis.occupancy.rooms.occupied} of ${kpis.occupancy.rooms.total} rooms occupied`}
          icon={Bed}
          gradient="violet"
        />
        <StatsCard
          title="Bed Occupancy"
          value={`${kpis.occupancy.beds.rate.toFixed(1)}%`}
          description={`${kpis.occupancy.beds.occupied} of ${kpis.occupancy.beds.total} beds occupied`}
          icon={Users}
          gradient="blue"
        />
        <StatsCard
          title="Today's Revenue"
          value={formatCurrency(Number(kpis.revenue.today) || 0, kpis.revenue.currency)}
          description="Daily revenue performance"
          icon={DollarSign}
          gradient="green"
        />
        <StatsCard
          title="Pending Operations"
          value={
            kpis.operations.pendingCheckIns + kpis.operations.pendingCheckOuts
          }
          description={`${kpis.operations.pendingCheckIns} check-ins, ${kpis.operations.pendingCheckOuts} check-outs`}
          icon={Clock}
          gradient="yellow"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid gap-4 lg:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue, kpis.revenue.currency)}
          description={`${selectedPeriod === 'TODAY' ? 'Today' : selectedPeriod === 'WEEK' ? 'This week' : selectedPeriod === 'MONTH' ? 'This month' : selectedPeriod === 'QUARTER' ? 'This quarter' : 'This year'}`}
          icon={TrendingUp}
          gradient="rose"
        />
        <StatsCard
          title="Total Bookings"
          value={(overview?.trends?.bookings || []).reduce((sum: number, item: any) => sum + (Number(item.bookings) || 0), 0)}
          description={`${selectedPeriod === 'TODAY' ? 'Today' : selectedPeriod === 'WEEK' ? 'This week' : selectedPeriod === 'MONTH' ? 'This month' : selectedPeriod === 'QUARTER' ? 'This quarter' : 'This year'}`}
          icon={Calendar}
          gradient="green"
        />
        <StatsCard
          title="Available Rooms"
          value={kpis.occupancy.rooms.available}
          description="Ready for booking"
          icon={Bed}
          gradient="violet"
        />
        <StatsCard
          title="Pending Payments"
          value={kpis.operations.pendingPayments}
          description="Awaiting payment"
          icon={DollarSign}
          gradient="yellow"
        />
      </div>

      {/* Charts Row 1 - Revenue & Occupancy */}
      <div className="grid gap-6 lg:grid-cols-2 overflow-hidden">
        <div className="overflow-hidden">
          <RevenueTrendChart
            data={trends.revenue}
            currency={kpis.revenue.currency}
          />
        </div>
        <div className="overflow-hidden">
          <OccupancyTrendChart data={trends.occupancy} />
        </div>
      </div>

      {/* Charts Row 2 - Distribution & Status */}
      <div className="grid gap-6 lg:grid-cols-2 overflow-hidden">
        <div className="overflow-hidden">
          <RevenueByRoomTypeChart
            data={
              revenueData.byRoomType as Array<{
                name: string;
                amount: number;
                percentage: number;
                fill: string;
              }>
            }
            currency={kpis.revenue.currency}
          />
        </div>
        <div className="overflow-hidden">
          <BookingStatusChart
            data={
              (
                [
                  { status: 'Confirmed', count: (overview?.trends?.bookings || []).reduce((s: number, it: any) => s + (Number(it.bookings) || 0), 0), fill: '#34d399' },
                  { status: 'Pending', count: kpis.operations.pendingCheckIns || 0, fill: '#fbbf24' },
                  { status: 'Checked In', count: kpis.occupancy.rooms.occupied || 0, fill: '#60a5fa' },
                  { status: 'Checked Out', count: kpis.operations.pendingCheckOuts || 0, fill: '#a78bfa' },
                  { status: 'Cancelled', count: 0, fill: '#f87171' },
                ]
              ) as Array<{
                status: string;
                count: number;
                fill: string;
              }>
            }
          />
        </div>
      </div>

      {/* Charts Row 3 - Demographics */}
      <div className="overflow-hidden">
        <GuestDemographicsChart
          data={
            guestData.byNationality as Array<{ country: string; guests: number }>
          }
        />
      </div>

      {/* Bottom Row - Activities & Alerts */}
      <div className="grid gap-6 lg:grid-cols-2 overflow-hidden">
        <div className="overflow-hidden">
          <RecentActivities activities={recentActivities} />
        </div>
        <div className="overflow-hidden">
          <AlertsPanel alerts={alerts} />
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}