import { apiClient } from '@/lib/api/axios-instance';
import {
  Guest,
  GuestDocument,
  CreateGuestData,
  UpdateGuestData,
  UpdateLoyaltyTierData,
  UploadDocumentData,
  FileType,
  ApiResponse,
  QueryParams,
} from '@/types';

export const guestService = {
  /**
   * Create a new guest
   */
  create: (data: CreateGuestData) =>
    apiClient.post<ApiResponse<Guest>>('/guests', data),

  /**
   * Get all guests with pagination and filters
   */
  getAll: (params?: QueryParams) =>
    apiClient.get<ApiResponse<Guest[]>>('/guests', { params }),

  /**
   * Get guest by ID
   */
  getById: (id: string) => apiClient.get<ApiResponse<Guest>>(`/guests/${id}`),

  /**
   * Update guest
   */
  update: (id: string, data: UpdateGuestData) =>
    apiClient.patch<ApiResponse<Guest>>(`/guests/${id}`, data),

  /**
   * Delete guest
   */
  delete: (id: string) => apiClient.delete<ApiResponse<null>>(`/guests/${id}`),

  /**
   * Search guests
   */
  search: (query: string, params?: QueryParams) =>
    apiClient.get<ApiResponse<Guest[]>>('/guests/search', {
      params: { q: query, ...params },
    }),

  /**
   * Get guest by email
   */
  getByEmail: (email: string) =>
    apiClient.get<ApiResponse<Guest>>(`/guests/email/${email}`),

  /**
   * Get guest by phone
   */
  getByPhone: (phone: string) =>
    apiClient.get<ApiResponse<Guest>>(`/guests/phone/${phone}`),

  /**
   * Update guest loyalty tier
   */
  updateLoyaltyTier: (id: string, data: UpdateLoyaltyTierData) =>
    apiClient.patch<ApiResponse<Guest>>(`/guests/${id}/loyalty-tier`, data),

  /**
   * Upload guest document
   */
  uploadDocument: (id: string, data: UploadDocumentData) => {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('fileType', data.fileType);
    formData.append('description', data.description || '');
    return apiClient.post<ApiResponse<GuestDocument>>(
      `/guests/${id}/documents/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
  },

  /**
   * Get guest documents
   */
  getDocuments: (id: string) =>
    apiClient.get<ApiResponse<GuestDocument[]>>(`/guests/${id}/documents`),

  /**
   * Update guest document
   */
  updateDocument: (documentId: string, data: { file?: File; fileType?: FileType; description?: string }) => {
    const formData = new FormData();
    if (data.file) {
      formData.append('file', data.file);
    }
    if (data.fileType) {
      formData.append('fileType', data.fileType);
    }
    if (data.description) {
      formData.append('description', data.description);
    }
    return apiClient.patch<ApiResponse<GuestDocument>>(
      `/guests/documents/${documentId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
  },

  /**
   * Delete guest document
   */
  deleteDocument: (documentId: string) =>
    apiClient.delete<ApiResponse<null>>(`/guests/documents/${documentId}`),

  /**
   * Get presigned URL for document
   */
  getDocumentUrl: (documentId: string) =>
    apiClient.get<ApiResponse<{ url: string }>>(`/guests/documents/${documentId}/url`),
};
