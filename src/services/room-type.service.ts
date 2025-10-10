import { apiClient } from '@/lib/api/axios-instance';
import {
  RoomType,
  CreateRoomTypeData,
  UpdateRoomTypeData,
  ApiResponse,
  QueryParams,
} from '@/types';

export const roomTypeService = {
  create: (data: CreateRoomTypeData) =>
    apiClient.post<ApiResponse<RoomType>>('/room-types', data),

  getAll: (params?: QueryParams) =>
    apiClient.get<ApiResponse<RoomType[]>>('/room-types', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<RoomType>>(`/room-types/${id}`),

  update: (id: string, data: UpdateRoomTypeData) =>
    apiClient.patch<ApiResponse<RoomType>>(`/room-types/${id}`, data),

  updateBeds: (
    id: string,
    beds: Array<{ bedTypeId: string; quantity: number }>,
  ) =>
    apiClient.patch<ApiResponse<RoomType>>(`/room-types/${id}/beds`, { beds }),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/room-types/${id}`),

  search: (query: string, params?: QueryParams) =>
    apiClient.get<ApiResponse<RoomType[]>>('/room-types/search', {
      params: { q: query, ...params },
    }),
};
