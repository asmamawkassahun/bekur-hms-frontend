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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
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

// Static/Dummy data for when API responses are empty
const DUMMY_DATA = {
  kpis: {
    occupancy: {
      rooms: { occupied: 85, available: 15, total: 100, rate: 85 },
      beds: { occupied: 142, available: 38, total: 180, rate: 78.9 },
    },
    revenue: { today: 45680, currency: 'ETB' },
    operations: {
      pendingCheckIns: 12,
      pendingCheckOuts: 8,
      pendingPayments: 5,
    },
    availability: { availableRooms: 15, availableBeds: 38 },
  },
  trends: {
    occupancy: [
      { date: 'Jan', rooms: 72, beds: 68 },
      { date: 'Feb', rooms: 75, beds: 71 },
      { date: 'Mar', rooms: 78, beds: 74 },
      { date: 'Apr', rooms: 82, beds: 78 },
      { date: 'May', rooms: 85, beds: 81 },
      { date: 'Jun', rooms: 88, beds: 84 },
      { date: 'Jul', rooms: 92, beds: 88 },
      { date: 'Aug', rooms: 90, beds: 86 },
      { date: 'Sep', rooms: 85, beds: 82 },
      { date: 'Oct', rooms: 83, beds: 79 },
      { date: 'Nov', rooms: 80, beds: 76 },
      { date: 'Dec', rooms: 85, beds: 81 },
    ],
    revenue: [
      { date: 'Jan', amount: 125000, bookings: 45 },
      { date: 'Feb', amount: 138000, bookings: 52 },
      { date: 'Mar', amount: 142000, bookings: 48 },
      { date: 'Apr', amount: 155000, bookings: 58 },
      { date: 'May', amount: 168000, bookings: 62 },
      { date: 'Jun', amount: 175000, bookings: 65 },
      { date: 'Jul', amount: 192000, bookings: 71 },
      { date: 'Aug', amount: 188000, bookings: 69 },
      { date: 'Sep', amount: 165000, bookings: 61 },
      { date: 'Oct', amount: 178000, bookings: 66 },
      { date: 'Nov', amount: 185000, bookings: 68 },
      { date: 'Dec', amount: 198000, bookings: 72 },
    ],
    bookings: [
      { status: 'Confirmed', count: 145, fill: '#34d399' },
      { status: 'Pending', count: 32, fill: '#fbbf24' },
      { status: 'Checked In', count: 85, fill: '#60a5fa' },
      { status: 'Checked Out', count: 68, fill: '#a78bfa' },
      { status: 'Cancelled', count: 12, fill: '#f87171' },
    ],
  },
  revenueData: {
    byRoomType: [
      { name: 'Deluxe Suite', amount: 485000, percentage: 35, fill: '#a78bfa' },
      {
        name: 'Standard Room',
        amount: 415000,
        percentage: 30,
        fill: '#60a5fa',
      },
      {
        name: 'Executive Suite',
        amount: 345000,
        percentage: 25,
        fill: '#fbbf24',
      },
      { name: 'Family Room', amount: 138000, percentage: 10, fill: '#f472b6' },
    ],
    byPaymentMethod: [],
  },
  guestData: {
    byNationality: [
      { country: 'USA', guests: 245 },
      { country: 'UK', guests: 182 },
      { country: 'Germany', guests: 156 },
      { country: 'France', guests: 134 },
      { country: 'Japan', guests: 98 },
      { country: 'Others', guests: 285 },
    ],
    byLoyaltyTier: [],
  },
  recentActivities: [
    {
      id: '1',
      type: 'check-in',
      description: 'John Smith checked in to Room 305',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      user: 'John Smith',
    },
    {
      id: '2',
      type: 'booking',
      description: 'Sarah Johnson made a booking for Room 412',
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      user: 'Sarah Johnson',
    },
    {
      id: '3',
      type: 'check-out',
      description: 'Michael Brown checked out from Room 208',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      user: 'Michael Brown',
    },
    {
      id: '4',
      type: 'payment',
      description: 'Payment of ETB 1,250 received from Emma Wilson',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      user: 'Emma Wilson',
    },
    {
      id: '5',
      type: 'booking',
      description: 'David Lee made a booking for Room 501',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      user: 'David Lee',
    },
  ],
  alerts: [
    {
      id: '1',
      type: 'warning',
      message: 'Low inventory for Deluxe Suites',
      severity: 'medium' as const,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      type: 'info',
      message: 'New booking received for Room 305',
      severity: 'low' as const,
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      type: 'success',
      message: 'Payment completed for Booking #1234',
      severity: 'low' as const,
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
  ],
};

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { overview, loading, selectedPeriod, selectedPropertyId } = useSelector(
    (state: RootState) => state.dashboard,
  );
  const { properties } = useSelector((state: RootState) => state.property);

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
          period: selectedPeriod,
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
        period: selectedPeriod,
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

  // Helper function to check if data is empty - memoized to prevent recalculation
  const isDataEmpty = useCallback((data: any) => {
    if (!data) return true;
    if (Array.isArray(data)) return data.length === 0;
    if (typeof data === 'object') {
      return (
        Object.keys(data).length === 0 ||
        (data.occupancy &&
          Object.values(data.occupancy).every((v: any) =>
            Array.isArray(v)
              ? v.length === 0
              : v === 0 || v === null || v === undefined,
          ))
      );
    }
    return false;
  }, []);

  // Use real API data now that backend is set up - only recalculate when overview reference changes
  const useStaticData = useMemo(() => {
    return !overview || isDataEmpty(overview);
  }, [overview, isDataEmpty]);

  // Safe data extraction with static data fallback
  const kpis = useMemo(() => {
    return useStaticData
      ? DUMMY_DATA.kpis
      : overview?.kpis || DUMMY_DATA.kpis;
  }, [useStaticData, overview]);

  // Transform API data to match chart expectations
  const trends = useMemo(() => {
    return useStaticData
      ? DUMMY_DATA.trends
      : {
        occupancy:
          overview?.trends?.occupancy?.map((item: any) => ({
            date: item.date,
            rooms: item.rooms || item.occupancy || 0,
            beds: item.beds || Math.round((item.occupancy || 0) * 0.9), // Slightly lower for beds
          })) || [],
        revenue:
          overview?.trends?.revenue?.map((item: any) => ({
            date: item.date,
            amount: Number(item.revenue) || 0,
            bookings: 0,
          })) || [],
        bookings: [
          { status: 'Confirmed', count: 145, fill: '#34d399' },
          { status: 'Pending', count: 32, fill: '#fbbf24' },
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
          { status: 'Cancelled', count: 12, fill: '#f87171' },
        ],
      };
  }, [useStaticData, overview]);

  // Calculate total revenue from trends for the selected period
  const totalRevenue = useMemo(() => {
    return useStaticData
      ? DUMMY_DATA.trends.revenue.reduce(
        (sum: number, item: any) => sum + (Number(item.amount) || 0),
        0,
      )
      : overview?.trends?.revenue?.reduce(
        (sum: number, item: any) => sum + (Number(item.revenue) || 0),
        0,
      ) || 0;
  }, [useStaticData, overview]);

  // Transform recent activities to match expected format
  const recentActivities = useMemo(() => {
    return useStaticData
      ? DUMMY_DATA.recentActivities
      : overview?.recentActivities?.map((activity: any) => ({
        id: activity.id,
        type: activity.type,
        description: `${activity.guestName} ${activity.action} - ${activity.roomInfo}`,
        timestamp: activity.timestamp,
        user: activity.guestName,
      })) || DUMMY_DATA.recentActivities;
  }, [useStaticData, overview]);

  const alerts = useMemo(() => {
    return useStaticData ? DUMMY_DATA.alerts : overview?.alerts || DUMMY_DATA.alerts;
  }, [useStaticData, overview]);

  // Transform guest data to match expected format
  const guestData = useMemo(() => {
    return useStaticData
      ? DUMMY_DATA.guestData
      : {
        byNationality:
          overview?.guestData?.byNationality?.map((item: any) => ({
            country: item.nationality,
            guests: item.count,
          })) || [],
        byLoyaltyTier: overview?.guestData?.byLoyaltyTier || [],
      };
  }, [useStaticData, overview]);

  // Transform revenue data to match expected format
  const revenueData = useMemo(() => {
    return useStaticData
      ? DUMMY_DATA.revenueData
      : {
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
                  percentage: 0, // Will be calculated
                  fill: '#a78bfa', // Default color
                });
              }
              return acc;
            }, [])
            .map((item: any, index: number) => ({
              ...item,
              percentage: Math.round((item.amount / totalRevenue) * 100),
              fill: ['#a78bfa', '#60a5fa', '#fbbf24', '#f472b6'][index % 4],
            })) || [],
        byPaymentMethod: overview?.revenueData?.byPaymentMethod || [],
      };
  }, [useStaticData, overview, totalRevenue]);

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          value={formatCurrency(kpis.revenue.today, kpis.revenue.currency)}
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue, kpis.revenue.currency)}
          description={`${selectedPeriod === 'TODAY' ? 'Today' : selectedPeriod === 'WEEK' ? 'This week' : selectedPeriod === 'MONTH' ? 'This month' : selectedPeriod === 'QUARTER' ? 'This quarter' : 'This year'}`}
          icon={TrendingUp}
          gradient="rose"
        />
        <StatsCard
          title="Total Bookings"
          value={trends?.revenue?.length || 0}
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
      <div className="grid gap-6 md:grid-cols-2 overflow-hidden">
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
      <div className="grid gap-6 md:grid-cols-2 overflow-hidden">
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
              trends.bookings as Array<{
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
      <div className="grid gap-6 md:grid-cols-2 overflow-hidden">
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
