// Guest Type
export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  loyaltyTier?: string;
  preferences?: string[];
  specialRequests?: string[];
  notes?: string;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Room Type
export interface RoomType {
  id: string;
  propertyId: string;
  name: string;
  description?: string;
  roomSize?: string;
  sizeUnit?: string;
  adultCapacity: number;
  childCapacity: number;
  basePrice: string;
  amenities?: string[];
  images?: string[];
  reserveCondition?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Room
export interface Room {
  id: string;
  propertyId: string;
  roomTypeId: string;
  number: string;
  floor: number;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roomType?: RoomType;
  type?: string; // For backward compatibility
}

// Property
export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  timezone: string;
  currency: string;
  taxRate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Booking Guest
export interface BookingGuest {
  id: string;
  bookingId: string;
  guestId: string;
  isPrimary: boolean;
  createdAt: string;
  guest?: Guest;
}

// Payment Summary Interface
export interface PaymentSummary {
  id: string;
  bookingId: string;
  totalAmount: string;
  paidAmount: string;
  unpaidAmount: string;
  lastPaymentAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Payment Status Interface
export interface PaymentStatus {
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  lastPaymentAt?: string;
}

// Reservation Types
export interface Reservation {
  id: string;
  propertyId: string;
  primaryGuestId: string;
  staffId?: string;
  bookingTypeId: string;
  bookingSourceId: string;
  accommodationType: 'ROOM' | 'BED';
  roomId?: string;
  bedId?: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  specialRequests?: string[];
  notes?: string;
  basePrice: string;
  totalPrice: string | number;
  discount: string;
  taxAmount: string;
  finalPrice: string;
  commissionRate: string;
  commissionAmount: string;
  netRevenue: string;
  status:
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED'
  | 'NO_SHOW';
  confirmedAt?: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  groupId?: string;
  channexBookingId?: string;
  externalBookingReference?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdBy?: string;
  updatedBy?: string;

  // Relations
  property?: Property;
  primaryGuest?: Guest;
  bookingGuests?: BookingGuest[];
  bookingType?: BookingType;
  bookingSource?: BookingSource;
  room?: Room;
  bed?: {
    id: string;
    number: string;
  };
  staff?: unknown;

  // Payment Information
  paymentSummary?: PaymentSummary;
  paymentStatus?: PaymentStatus;

  // Backward compatibility
  guestId?: string;
  currency?: string;
  guest?: Guest;
}

export interface CreateReservationData {
  propertyId: string;
  guestIds: string[];
  bookingTypeId: string;
  bookingSourceId: string;
  accommodationType: 'ROOM' | 'BED';
  roomId?: string;
  bedId?: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  specialRequests?: string[];
  notes?: string;
}

export interface UpdateReservationData {
  checkIn?: string;
  checkOut?: string;
  status?:
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED'
  | 'NO_SHOW';
  adults?: number;
  children?: number;
  specialRequests?: string[];
  notes?: string;
}

export interface ReservationFilters {
  status?:
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED'
  | 'NO_SHOW';
  checkInFrom?: string;
  checkInTo?: string;
  guestName?: string;
  roomNumber?: string;
  propertyId?: string;
}

// Check-in/Check-out Types
export interface CheckInData {
  reservationId: string;
  actualCheckIn: string;
  notes?: string;
}

export interface CheckOutData {
  reservationId: string;
  actualCheckOut: string;
  notes?: string;
}

// Payment Details Types
export interface PaymentDetailsData {
  reservationId: string;
  discountReason?: string;
  discountPercentage?: number;
  discountAmount?: number;
  commissionRate?: number;
  commissionAmount?: number;
  paymentMode: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'UPI';
  totalAmount: number;
  advanceAmount: number;
  advanceRemarks?: string;
}

// Booking Type Types
export interface BookingType {
  id: string;
  name: string;
  sourceType?: 'DIRECT' | 'OTA' | 'CHANNEL_MANAGER' | 'CORPORATE' | 'AGENT';
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Booking Source Types
export interface BookingSource {
  id: string;
  name: string;
  sourceType: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CalculatePriceData {
  propertyId: string;
  accommodationType: string;
  accommodationId: string;
  checkIn?: string;
  checkOut?: string;
  guestId: string; // Single guest ID (UUID string), not array
  bookingSourceId?: string;
}