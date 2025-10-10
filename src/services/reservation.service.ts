import { apiClient } from '@/lib/api/axios-instance';
import {
  Reservation,
  CreateReservationData,
  UpdateReservationData,
  CheckInData,
  CheckOutData,
  ReservationFilters,
  PaymentDetailsData,
  BookingType,
  BookingSource,
  ApiResponse,
  QueryParams,
} from '@/types';

export const reservationService = {
  /**
   * Create a new reservation
   */
  create: (data: CreateReservationData) =>
    apiClient.post<ApiResponse<Reservation>>('/bookings', data),

  /**
   * Get all reservations with pagination and filters
   */
  getAll: (params?: QueryParams & ReservationFilters) =>
    apiClient.get<ApiResponse<Reservation[]>>('/bookings', { params }),

  /**
   * Get reservation by ID
   */
  getById: (id: string) =>
    apiClient.get<ApiResponse<Reservation>>(`/bookings/${id}`),

  /**
   * Update reservation
   */
  update: (id: string, data: UpdateReservationData) =>
    apiClient.patch<ApiResponse<Reservation>>(`/bookings/${id}`, data),

  /**
   * Delete reservation
   */
  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/bookings/${id}`),

  /**
   * Check-in guest
   */
  checkIn: (data: CheckInData) =>
    apiClient.post<ApiResponse<Reservation>>('/reservations/check-in', data),

  /**
   * Check-out guest
   */
  checkOut: (data: CheckOutData) =>
    apiClient.post<ApiResponse<Reservation>>('/reservations/check-out', data),

  /**
   * Cancel reservation
   */
  cancel: (id: string, reason?: string) =>
    apiClient.patch<ApiResponse<Reservation>>(`/reservations/${id}/cancel`, {
      reason,
    }),

  /**
   * Get availability for date range
   */
  getAvailability: (params: {
    propertyId: string;
    checkIn: string;
    checkOut: string;
    roomType?: string;
  }) =>
    apiClient.get<ApiResponse<{ rooms: unknown[]; beds: unknown[] }>>(
      '/reservations/availability',
      { params },
    ),

  /**
   * Add payment details to reservation
   */
  addPaymentDetails: (data: PaymentDetailsData) =>
    apiClient.post<ApiResponse<Reservation>>('/bookings/payment-details', data),

  /**
   * Get all booking types with pagination and filters
   */
  getAllBookingTypes: (params?: QueryParams & { isActive?: boolean; name?: string }) =>
    apiClient.get<ApiResponse<BookingType[]>>('/booking-types', { params }),

  /**
   * Get booking type by ID
   */
  getBookingTypeById: (id: string) =>
    apiClient.get<ApiResponse<BookingType>>(`/booking-types/${id}`),

  /**
   * Get all booking sources with pagination and filters
   */
  getAllBookingSources: (params?: QueryParams & { sourceType?: string; isActive?: boolean; name?: string }) =>
    apiClient.get<ApiResponse<BookingSource[]>>('/booking-sources', { params }),

  /**
   * Get booking source by ID
   */
  getBookingSourceById: (id: string) =>
    apiClient.get<ApiResponse<BookingSource>>(`/booking-sources/${id}`),
};
