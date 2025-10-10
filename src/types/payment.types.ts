// Payment Types

export type PaymentStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type PaymentMethod =
  | 'CASH'
  | 'CARD'
  | 'BANK_TRANSFER'
  | 'MOBILE_MONEY'
  | 'ONLINE_GATEWAY';

export interface Payment {
  id: string;
  propertyId?: string;
  reservationId?: string;
  guestId?: string;
  reference?: string;
  description?: string;
  method: PaymentMethod;
  status: PaymentStatus;
  currency: string;
  amount: number;
  refundedAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentData {
  bookingId: string; // Required by API
  guestId: string; // Required by API
  reference?: string;
  description?: string;
  method: PaymentMethod;
  currency: string;
  amount: number;
  notes?: string;
}

export interface UpdatePaymentData {
  reference?: string;
  description?: string;
  method?: PaymentMethod;
}

export interface RefundPaymentData {
  amount: number;
  reason?: string;
}


