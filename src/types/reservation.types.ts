// Reservation Types
export interface Reservation {
  id: string;
  guestId: string;
  propertyId: string;
  roomId?: string;
  bedId?: string;
  checkIn: string;
  checkOut: string;
  status:
    | 'PENDING'
    | 'CONFIRMED'
    | 'CHECKED_IN'
    | 'CHECKED_OUT'
    | 'CANCELLED'
    | 'NO_SHOW';
  totalPrice: number;
  currency: string;
  adults: number;
  children: number;
  specialRequests?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  guest?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  room?: {
    id: string;
    number: string;
    type: string;
  };
  bed?: {
    id: string;
    number: string;
  };
}

export interface CreateReservationData {
  guestId: string;
  propertyId: string;
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
