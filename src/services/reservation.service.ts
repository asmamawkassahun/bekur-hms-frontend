import { apiClient } from '@/lib/api/axios-instance';
import {
  Reservation,
  CreateReservationData,
  UpdateReservationData,
  CheckInData,
  CheckOutData,
  ReservationFilters,
  ApiResponse,
  QueryParams,
} from '@/types';

export const reservationService = {
  /**
   * Create a new reservation
   */
  create: (data: CreateReservationData) =>
    apiClient.post<ApiResponse<Reservation>>('/reservations', data),

  /**
   * Get all reservations with pagination and filters
   */
  getAll: (params?: QueryParams & ReservationFilters) =>
    apiClient.get<ApiResponse<Reservation[]>>('/reservations', { params }),

  /**
   * Get reservation by ID
   */
  getById: (id: string) =>
    apiClient.get<ApiResponse<Reservation>>(`/reservations/${id}`),

  /**
   * Update reservation
   */
  update: (id: string, data: UpdateReservationData) =>
    apiClient.patch<ApiResponse<Reservation>>(`/reservations/${id}`, data),

  /**
   * Delete reservation
   */
  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/reservations/${id}`),

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
};
