import { apiClient } from '@/lib/api/axios-instance';
import {
  RoomType,
  CreateRoomTypeData,
  UpdateRoomTypeData,
  RoomTypeImage,
  UploadRoomTypeImageData,
  UpdateRoomTypeImageData,
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

  // Image Management Methods
  uploadImage: (roomTypeId: string, file: File, data: UploadRoomTypeImageData) => {
    const formData = new FormData();
    formData.append('file', file);
    if (data.description) formData.append('description', data.description);
    if (data.displayOrder) formData.append('displayOrder', data.displayOrder.toString());
    
    return apiClient.post<ApiResponse<RoomTypeImage>>(
      `/room-types/${roomTypeId}/images/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  getImages: (roomTypeId: string) =>
    apiClient.get<ApiResponse<RoomTypeImage[]>>(`/room-types/${roomTypeId}/images`),

  updateImage: (imageId: string, file: File | null, data: UpdateRoomTypeImageData) => {
    const formData = new FormData();
    if (file) formData.append('file', file);
    if (data.description) formData.append('description', data.description);
    if (data.displayOrder) formData.append('displayOrder', data.displayOrder.toString());
    
    return apiClient.patch<ApiResponse<RoomTypeImage>>(
      `/room-types/images/${imageId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  deleteImage: (imageId: string) =>
    apiClient.delete<ApiResponse<null>>(`/room-types/images/${imageId}`),

  reorderImages: (roomTypeId: string, imageIds: string[]) =>
    apiClient.patch<ApiResponse<RoomTypeImage[]>>(
      `/room-types/${roomTypeId}/images/reorder`,
      { imageIds }
    ),
};
