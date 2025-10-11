import { apiClient } from '@/lib/api/axios-instance';
import type { ApiResponse, QueryParams } from '@/types';

export interface BookingType {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookingSource {
  id: string;
  name: string;
  bookingTypeId: string;
  bookingType?: BookingType;
  commissionRate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingTypeData {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateBookingTypeData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateBookingSourceData {
  name: string;
  bookingTypeId: string;
  commissionRate: number;
  isActive?: boolean;
}

export interface UpdateBookingSourceData {
  name?: string;
  bookingTypeId?: string;
  commissionRate?: number;
  isActive?: boolean;
}

export const bookingTypeService = {
  getAll: (params?: QueryParams & { isActive?: boolean; name?: string }) =>
    apiClient.get<ApiResponse<BookingType[]>>('/booking-types', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<BookingType>>(`/booking-types/${id}`),

  create: (data: CreateBookingTypeData) =>
    apiClient.post<ApiResponse<BookingType>>('/booking-types', data),

  update: (id: string, data: UpdateBookingTypeData) =>
    apiClient.patch<ApiResponse<BookingType>>(`/booking-types/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<BookingType>>(`/booking-types/${id}`),

  activate: (id: string) =>
    apiClient.post<ApiResponse<BookingType>>(`/booking-types/${id}/activate`),

  deactivate: (id: string) =>
    apiClient.post<ApiResponse<BookingType>>(`/booking-types/${id}/deactivate`),
};

export const bookingSourceService = {
  getAll: (
    params?: QueryParams & { isActive?: boolean; bookingTypeId?: string },
  ) =>
    apiClient.get<ApiResponse<BookingSource[]>>('/booking-sources', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<BookingSource>>(`/booking-sources/${id}`),

  create: (data: CreateBookingSourceData) =>
    apiClient.post<ApiResponse<BookingSource>>('/booking-sources', data),

  update: (id: string, data: UpdateBookingSourceData) =>
    apiClient.patch<ApiResponse<BookingSource>>(`/booking-sources/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<BookingSource>>(`/booking-sources/${id}`),

  activate: (id: string) =>
    apiClient.post<ApiResponse<BookingSource>>(
      `/booking-sources/${id}/activate`,
    ),

  deactivate: (id: string) =>
    apiClient.post<ApiResponse<BookingSource>>(
      `/booking-sources/${id}/deactivate`,
    ),

  calculateCommission: (data: { amount: number; commissionRate: number }) =>
    apiClient.post<
      ApiResponse<{
        amount: number;
        commissionRate: number;
        commissionAmount: number;
        netAmount: number;
      }>
    >('/booking-sources/calculate-commission', data),
};
