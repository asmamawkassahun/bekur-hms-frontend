// Reports & Analytics Types

export interface RevenueByDate {
  date: string; // YYYY-MM-DD
  revenue: number;
  occupancyRate: number; // 0-100
}

export interface LoyaltyBreakdownItem {
  tier: string; // BRONZE/SILVER/GOLD/PLATINUM
  count: number;
}

export interface RevenueOccupancyReport {
  totalRevenue: number;
  averageDailyRevenue?: number;
  occupancyRate: number; // 0-100
  byDate: RevenueByDate[];
}

export interface GuestAnalyticsReport {
  totalGuests: number;
  newGuests: number;
  activeGuests: number;
  loyaltyBreakdown: LoyaltyBreakdownItem[];
}

export interface FinancialMetricsReport {
  totalPayments: number;
  totalRefunds: number;
  netRevenue: number;
}

export interface ReportsSummary {
  revenueOccupancy: RevenueOccupancyReport;
  guestAnalytics: GuestAnalyticsReport;
  financialMetrics: FinancialMetricsReport;
}

export interface ReportsQueryParams {
  propertyId?: string;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
}


