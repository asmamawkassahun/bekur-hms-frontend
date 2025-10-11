import { apiClient } from '@/lib/api/axios-instance';
import {
  Room,
  Dormitory,
  Bed,
  CreateRoomData,
  UpdateRoomData,
  UpdateRoomStatusData,
  CreateDormitoryData,
  UpdateDormitoryData,
  CreateBedData,
  UpdateBedData,
  UpdateBedStatusData,
  BulkCreateRoomsData,
  DailyOccupancy,
  ApiResponse,
  QueryParams,
} from '@/types';

export const roomService = {
  /**
   * Create a new room
   */
  create: (data: CreateRoomData) =>
    apiClient.post<ApiResponse<Room>>('/rooms', data),

  /**
   * Get all rooms with pagination and filters
   */
  getAll: (params?: QueryParams) =>
    apiClient.get<ApiResponse<Room[]>>('/rooms', { params }),

  /**
   * Get room by ID
   */
  getById: (id: string) => apiClient.get<ApiResponse<Room>>(`/rooms/${id}`),

  /**
   * Update room
   */
  update: (id: string, data: UpdateRoomData) =>
    apiClient.patch<ApiResponse<Room>>(`/rooms/${id}`, data),

  /**
   * Delete room
   */
  delete: (id: string) => apiClient.delete<ApiResponse<null>>(`/rooms/${id}`),

  /**
   * Update room status
   */
  updateStatus: (id: string, data: UpdateRoomStatusData) =>
    apiClient.patch<ApiResponse<Room>>(`/rooms/${id}/status`, data),

  /**
   * Bulk create rooms
   */
  bulkCreate: (data: BulkCreateRoomsData) =>
    apiClient.post<ApiResponse<Room[]>>('/rooms/bulk', data),

  /**
   * Search rooms
   */
  search: (query: string, params?: QueryParams) =>
    apiClient.get<ApiResponse<Room[]>>('/rooms/search', {
      params: { q: query, ...params },
    }),

  /**
   * Get occupancy calendar for a property and month
   */
  getOccupancyCalendar: (params: {
    propertyId: string;
    year: number;
    month: number;
  }) =>
    apiClient.get<ApiResponse<DailyOccupancy[]>>('/rooms/occupancy-calendar', {
      params,
    }),

  /**
   * Get available rooms for a specific period (period-based availability)
   */
  getAvailable: (params: {
    propertyId: string;
    checkIn: string;
    checkOut: string;
    roomTypeId?: string;
  }) => apiClient.get<ApiResponse<Room[]>>('/rooms/available', { params }),
};

export const dormitoryService = {
  /**
   * Create a new dormitory
   */
  create: (data: CreateDormitoryData) =>
    apiClient.post<ApiResponse<Dormitory>>('/dormitories', data),

  /**
   * Get all dormitories with pagination and filters
   */
  getAll: (params?: QueryParams) =>
    apiClient.get<ApiResponse<Dormitory[]>>('/dormitories', { params }),

  /**
   * Get dormitory by ID
   */
  getById: (id: string) =>
    apiClient.get<ApiResponse<Dormitory>>(`/dormitories/${id}`),

  /**
   * Update dormitory
   */
  update: (id: string, data: UpdateDormitoryData) =>
    apiClient.patch<ApiResponse<Dormitory>>(`/dormitories/${id}`, data),

  /**
   * Delete dormitory
   */
  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/dormitories/${id}`),

  /**
   * Search dormitories
   */
  search: (query: string, params?: QueryParams) =>
    apiClient.get<ApiResponse<Dormitory[]>>('/dormitories/search', {
      params: { q: query, ...params },
    }),
};

export const bedService = {
  /**
   * Create a new bed
   */
  create: (data: CreateBedData) =>
    apiClient.post<ApiResponse<Bed>>('/beds', data),

  /**
   * Get all beds with pagination and filters
   */
  getAll: (params?: QueryParams) =>
    apiClient.get<ApiResponse<Bed[]>>('/beds', { params }),

  /**
   * Get bed by ID
   */
  getById: (id: string) => apiClient.get<ApiResponse<Bed>>(`/beds/${id}`),

  /**
   * Update bed
   */
  update: (id: string, data: UpdateBedData) =>
    apiClient.patch<ApiResponse<Bed>>(`/beds/${id}`, data),

  /**
   * Delete bed
   */
  delete: (id: string) => apiClient.delete<ApiResponse<null>>(`/beds/${id}`),

  /**
   * Update bed status
   */
  updateStatus: (id: string, data: UpdateBedStatusData) =>
    apiClient.patch<ApiResponse<Bed>>(`/beds/${id}/status`, data),

  /**
   * Search beds
   */
  search: (query: string, params?: QueryParams) =>
    apiClient.get<ApiResponse<Bed[]>>('/beds/search', {
      params: { q: query, ...params },
    }),

  /**
   * Get available beds for a specific period (period-based availability)
   */
  getAvailable: (params: {
    propertyId: string;
    checkIn: string;
    checkOut: string;
    dormitoryId: string;
  }) => apiClient.get<ApiResponse<Bed[]>>('/beds/available', { params }),
};
