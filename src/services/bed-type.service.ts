import { apiClient } from '@/lib/api/axios-instance';
import {
  BedType,
  CreateBedTypeData,
  UpdateBedTypeData,
  ApiResponse,
  QueryParams,
} from '@/types';

export const bedTypeService = {
  create: (data: CreateBedTypeData) =>
    apiClient.post<ApiResponse<BedType>>('/bed-types', data),

  getAll: (params?: QueryParams) =>
    apiClient.get<ApiResponse<BedType[]>>('/bed-types', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<BedType>>(`/bed-types/${id}`),

  update: (id: string, data: UpdateBedTypeData) =>
    apiClient.patch<ApiResponse<BedType>>(`/bed-types/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/bed-types/${id}`),

  search: (query: string, params?: QueryParams) =>
    apiClient.get<ApiResponse<BedType[]>>('/bed-types/search', {
      params: { q: query, ...params },
    }),
};
