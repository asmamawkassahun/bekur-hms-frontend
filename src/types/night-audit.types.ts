import type { ApiResponse, PaginationMeta, QueryParams } from './api.types';

export type NightAuditStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'REOPENED';

export interface PaymentTransaction {
  id: string;
  amount: number;
  method: string;
  status: string;
  guestName?: string;
  bookingId?: string;
  date: string;
}

export interface PaymentBreakdown {
  byMethod: Record<string, number>;
  byStatus: Record<string, number>;
  transactions: PaymentTransaction[];
}

export interface BookingTypeMetrics {
  count: number;
  revenue: number;
}

export interface BookingSourceMetrics extends BookingTypeMetrics {
  commission: number;
  netRevenue: number;
}

export interface BookingBreakdown {
  byType: Record<string, BookingTypeMetrics>;
  bySource: Record<string, BookingSourceMetrics>;
  byAccommodation: Record<'ROOM' | 'BED', BookingTypeMetrics>;
  total: number;
}

export interface ChargesSummary {
  totalAmount: number;
  basePrice: number;
  taxAmount: number;
  discount: number;
  commission: number;
  netRevenue: number;
}

export interface GuestSummary {
  id: string;
  name: string;
  email?: string;
}

export interface GuestLedgerEntry {
  bookingId: string;
  primaryGuest: GuestSummary;
  additionalGuests?: GuestSummary[];
  accommodation: string; // e.g., "Room 101" or "Dormitory A - Bed 3"
  checkIn: string; // ISO date
  checkOut: string; // ISO date
  status: string;
  charges: ChargesSummary;
  payments: PaymentTransaction[];
  balance: number;
}

// Enhanced analytics types
export interface HourlyRevenueData {
  hour: number;
  revenue: number;
  roomRevenue: number;
  bedRevenue: number;
  bookings: number;
}

export interface HourlyOccupancyData {
  hour: number;
  roomOccupancy: number;
  bedOccupancy: number;
  roomOccupancyRate: number;
  bedOccupancyRate: number;
}

export interface NationalityDemographic {
  country: string;
  count: number;
  revenue: number;
}

export interface AgeGroupDemographic {
  ageGroup: string;
  count: number;
}

export interface BookingChannelDemographic {
  channel: string;
  count: number;
  revenue: number;
}

export interface LoyaltyStatusDemographic {
  status: string;
  count: number;
}

export interface GuestDemographics {
  byNationality: NationalityDemographic[];
  byAgeGroup: AgeGroupDemographic[];
  byBookingChannel: BookingChannelDemographic[];
  byLoyaltyStatus: LoyaltyStatusDemographic[];
}

export interface PreviousDayComparison {
  businessDate: string;
  totalRevenue: number;
  netRevenue: number;
  netAfterCommission: number;
  roomOccupancyRate: number;
  bedOccupancyRate: number;
  totalBookings: number;
  checkIns: number;
  checkOuts: number;
  totalGuests: number;
  newGuests: number;
}

export interface NightAudit {
  id: string;
  propertyId: string;
  businessDate: string; // start of day in ISO
  auditDate: string; // when audit ran
  status: NightAuditStatus;

  // Financial Summary
  totalRevenue: number;
  roomRevenue: number;
  bedRevenue: number;
  totalPayments: number;
  cashPayments: number;
  cardPayments: number;
  otherPayments: number;
  totalRefunds: number;
  netRevenue: number;
  totalCommission: number;
  netAfterCommission: number;
  outstandingBalance: number;
  partialPayments: number;

  // Occupancy Summary
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  outOfOrderRooms: number;
  roomOccupancyRate: number; // percent
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  bedOccupancyRate: number; // percent

  // Booking Statistics
  totalBookings: number;
  checkIns: number;
  checkOuts: number;
  cancellations: number;
  noShows: number;

  // Guest Statistics
  totalGuests: number;
  newGuests: number;
  returningGuests: number;

  // Detailed Data
  guestLedger: GuestLedgerEntry[];
  paymentBreakdown: PaymentBreakdown;
  bookingBreakdown: BookingBreakdown;
  discrepancies: string[];

  // Enhanced Analytics
  hourlyRevenue?: HourlyRevenueData[];
  hourlyOccupancy?: HourlyOccupancyData[];
  guestDemographics?: GuestDemographics;
  previousDayComparison?: PreviousDayComparison | null;

  // Audit Trail
  performedBy?: string;
  performedByStaff?: Record<string, unknown>;
  approvedBy?: string | null;
  approvedAt?: string | null;
  notes?: string | null;
}

export interface NightAuditQueryParams extends QueryParams {
  propertyId?: string;
  status?: NightAuditStatus;
  businessDateFrom?: string; // YYYY-MM-DD
  businessDateTo?: string; // YYYY-MM-DD
}

export interface RunNightAuditPayload {
  propertyId: string;
  businessDate: string; // YYYY-MM-DD
  notes?: string;
}

export interface ApproveNightAuditPayload {
  notes?: string;
}

export interface PropertySettings {
  id?: string;
  propertyId?: string;
  dayOpenTime: string; // HH:MM
  dayCloseTime: string; // HH:MM
  autoRunNightAudit: boolean;
  nightAuditTime: string; // HH:MM
  defaultCheckInTime: string; // HH:MM
  defaultCheckOutTime: string; // HH:MM
  lateCheckOutGracePeriod: number; // minutes
  earlyCheckInGracePeriod: number; // minutes
  autoCloseDay: boolean;
  requireApproval: boolean;
}

export type NightAuditListResponse = ApiResponse<NightAudit[]> & {
  meta?: PaginationMeta;
};

export type NightAuditResponse = ApiResponse<NightAudit>;
