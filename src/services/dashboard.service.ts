import { apiClient } from '@/lib/api/axios-instance';
import { ApiResponse } from '@/types';

export interface DashboardKPIs {
  occupancy: {
    rooms: { occupied: number; available: number; total: number; rate: number };
    beds: { occupied: number; available: number; total: number; rate: number };
  };
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    currency: string;
  };
  operations: {
    pendingCheckIns: number;
    pendingCheckOuts: number;
    pendingPayments: number;
  };
  availability: {
    availableRooms: number;
    availableBeds: number;
  };
}

export interface DashboardTrends {
  occupancy: Array<{ date: string; rooms: number; beds: number }>;
  revenue: Array<{ date: string; amount: number; bookings: number }>;
  bookings: Array<{ date: string; confirmed: number; pending: number; cancelled: number }>;
}

export interface DashboardOverview {
  kpis: DashboardKPIs;
  trends: DashboardTrends;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user: string;
  }>;
  alerts: Array<{
    id: string;
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: string;
  }>;
  guestData: {
    byNationality: Array<{ nationality: string; count: number }>;
    byLoyaltyTier: Array<{ tier: string; count: number }>;
  };
  revenueData: {
    byRoomType: Array<{ name: string; amount: number }>;
    byPaymentMethod: Array<{ method: string; amount: number }>;
  };
}

export const dashboardService = {
  getOverview: (params?: {
    propertyId?: string;
    period?: 'TODAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
    startDate?: string;
    endDate?: string;
  }) => apiClient.get<ApiResponse<DashboardOverview>>('/dashboard/overview', { params }),

  getKPIs: (params?: {
    propertyId?: string;
    period?: string;
  }) => apiClient.get<ApiResponse<DashboardKPIs>>('/dashboard/kpis', { params }),

  getTrends: (params?: {
    propertyId?: string;
    period?: string;
  }) => apiClient.get<ApiResponse<DashboardTrends>>('/dashboard/trends', { params }),
};

