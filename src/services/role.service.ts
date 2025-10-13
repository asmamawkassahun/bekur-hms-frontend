import { apiClient } from '@/lib/api/axios-instance';
import { ApiResponse } from '@/types';

export interface Role {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const roleService = {
  getAll: () => apiClient.get<ApiResponse<Role[]>>('/roles'),
  getById: (id: string) => apiClient.get<ApiResponse<Role>>(`/roles/${id}`),
};
