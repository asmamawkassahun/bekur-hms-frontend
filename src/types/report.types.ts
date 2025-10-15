// Reports & Analytics Types

// Enums
export enum ReportType {
  OCCUPANCY = 'OCCUPANCY',
  REVENUE = 'REVENUE',
  OPERATIONAL = 'OPERATIONAL',
  FINANCIAL = 'FINANCIAL',
  GUEST_ANALYTICS = 'GUEST_ANALYTICS',
}

export type GroupByPeriod = 'day' | 'week' | 'month' | 'year';

// Base interfaces
export interface RevenueByDate {
  date: string; // YYYY-MM-DD
  revenue: number;
  occupancyRate: number; // 0-100
}

export interface LoyaltyBreakdownItem {
  tier: string; // BRONZE/SILVER/GOLD/PLATINUM
  count: number;
}

// Chart data interfaces
export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area';
  data: Array<{ x: string; y: number }> | Array<{ name: string; value: number }>;
}

export interface ChartConfig {
  occupancyTrend: ChartData;
  revenueTrend: ChartData;
  revenueByMethod: ChartData;
  revenueByRoomType: ChartData;
  ageDistribution: ChartData;
  bookingPatterns: ChartData;
}

// Report generation DTOs
export interface GenerateReportDto {
  type: ReportType;
  propertyId: string;
  startDate: string;
  endDate: string;
  groupBy?: GroupByPeriod;
  includeCharts?: boolean;
  roomTypeId?: string;
  dormitoryId?: string;
  paymentMethod?: string;
  guestId?: string;
}

export interface ReportQueryDto {
  type?: ReportType;
  propertyId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Occupancy Report Types
export interface OccupancyReportData {
  summary: {
    totalRooms: number;
    totalBeds: number;
    totalRoomNights: number;
    totalBedNights: number;
    roomOccupancyRate: number;
    bedOccupancyRate: number;
    averageRoomOccupancy: number;
    averageBedOccupancy: number;
  };
  dailyData: Array<{
    date: string;
    occupiedRooms: number;
    occupiedBeds: number;
    availableRooms: number;
    availableBeds: number;
    roomOccupancyRate: number;
    bedOccupancyRate: number;
  }>;
  charts: {
    occupancyTrend: ChartData;
  };
}

// Revenue Report Types
export interface RevenueByMethod {
  method: string;
  amount: number;
  percentage: number;
}

export interface RevenueByRoomType {
  type: string;
  amount: number;
  percentage: number;
}

export interface RevenueReportData {
  summary: {
    totalRevenue: number;
    totalReservations: number;
    averageRevenuePerReservation: number;
    averageDailyRevenue: number;
  };
  dailyData: Array<{
    date: string;
    revenue: number;
    reservations: number;
  }>;
  revenueByMethod: RevenueByMethod[];
  revenueByRoomType: RevenueByRoomType[];
  charts: {
    revenueTrend: ChartData;
    revenueByMethod: ChartData;
    revenueByRoomType: ChartData;
  };
}

// Operational Report Types
export interface ArrivalDeparture {
  id: string;
  guestName: string;
  checkIn?: string;
  checkOut?: string;
  roomNumber: string;
  status: string;
}

export interface HousekeepingStatus {
  status: string;
  count: number;
  percentage: number;
}

export interface OperationalReportData {
  summary: {
    totalArrivals: number;
    totalDepartures: number;
    currentGuests: number;
    noShows: number;
    housekeepingTasksCompleted: number;
    housekeepingTasksPending: number;
  };
  arrivals: ArrivalDeparture[];
  departures: ArrivalDeparture[];
  currentGuests: ArrivalDeparture[];
  noShows: ArrivalDeparture[];
  housekeepingStatus: HousekeepingStatus[];
}

// Financial Report Types
export interface FinancialReportData {
  summary: {
    totalRevenue: number;
    totalRefunds: number;
    netRevenue: number;
    totalInvoices: number;
    paidInvoices: number;
    outstandingInvoices: number;
    overdueInvoices: number;
    totalInvoiceAmount: number;
    paidInvoiceAmount: number;
    outstandingAmount: number;
  };
  revenueByMethod: RevenueByMethod[];
  dailyFinancial: Array<{
    date: string;
    revenue: number;
    refunds: number;
    netRevenue: number;
  }>;
  charts: {
    netRevenue: ChartData;
  };
}

// Guest Analytics Report Types
export interface AgeGroup {
  age: string;
  count: number;
}

export interface CountryData {
  country: string;
  count: number;
}

export interface GenderData {
  gender: string;
  count: number;
}

export interface AdvanceBookingData {
  '0-7': number;
  '8-30': number;
  '31-90': number;
  '90+': number;
}

export interface DayOfWeekData {
  friday: number;
  saturday: number;
  sunday: number;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
}

export interface LengthOfStayData {
  '1': number;
  '2-3': number;
  '4-7': number;
  '8+': number;
}

export interface LoyaltyTier {
  tier: string;
  count: number;
  percentage: number;
}

export interface RepeatGuest {
  id: string;
  name: string;
  email: string;
  totalStays: number;
  lastStay: string;
}

export interface GuestAnalyticsReportData {
  summary: {
    totalGuests: number;
    newGuests: number;
    repeatGuests: number;
    averageStaysPerGuest: number;
  };
  demographics: {
    ageGroups: AgeGroup[];
    countries: CountryData[];
    genders: GenderData[];
  };
  bookingPatterns: {
    advanceBooking: AdvanceBookingData;
    dayOfWeek: DayOfWeekData;
    lengthOfStay: LengthOfStayData;
  };
  loyaltyAnalysis: LoyaltyTier[];
  repeatGuests: RepeatGuest[];
  charts: {
    ageDistribution: ChartData;
    countryDistribution: ChartData;
    genderDistribution: ChartData;
    bookingPatterns: ChartData;
  };
}

// Report Response Types
export interface ReportResponse {
  id: string;
  type: ReportType;
  propertyId: string;
  startDate: string;
  endDate: string;
  data: OccupancyReportData | RevenueReportData | OperationalReportData | FinancialReportData | GuestAnalyticsReportData;
  createdAt: string;
  property?: {
    id: string;
    name: string;
  };
}

export interface ReportsListResponse {
  data: Array<{
    id: string;
    type: ReportType;
    propertyId: string;
    startDate: string;
    endDate: string;
    createdAt: string;
    property: {
      id: string;
      name: string;
    };
  }>;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Legacy interfaces for backward compatibility
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


