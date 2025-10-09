import { apiClient } from '@/lib/api/axios-instance';
import {
  Property,
  PropertyStats,
  CreatePropertyData,
  UpdatePropertyData,
  ApiResponse,
  QueryParams,
} from '@/types';

export const propertyService = {
  /**
   * Create a new property
   */
  create: (data: CreatePropertyData) =>
    apiClient.post<ApiResponse<Property>>('/properties', data),

  /**
   * Get all properties with pagination and filters
   */
  getAll: (params?: QueryParams) =>
    apiClient.get<ApiResponse<Property[]>>('/properties', { params }),

  /**
   * Get property by ID
   */
  getById: (id: string) =>
    apiClient.get<ApiResponse<Property>>(`/properties/${id}`),

  /**
   * Update property
   */
  update: (id: string, data: UpdatePropertyData) =>
    apiClient.patch<ApiResponse<Property>>(`/properties/${id}`, data),

  /**
   * Delete property
   */
  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/properties/${id}`),

  /**
   * Get property statistics
   */
  getStats: (id: string) =>
    apiClient.get<ApiResponse<PropertyStats>>(`/properties/${id}/stats`),
};
