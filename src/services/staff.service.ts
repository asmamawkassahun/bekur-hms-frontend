import { apiClient } from '@/lib/api/axios-instance';
import { ApiResponse, QueryParams } from '@/types';
import { Staff, CreateStaffData, UpdateStaffData, AssignRolesData } from '@/types/staff.types';

export const staffService = {
  create: (data: CreateStaffData) => apiClient.post<ApiResponse<Staff>>('/staff', data),
  getAll: (params?: QueryParams) => apiClient.get<ApiResponse<Staff[]>>('/staff', { params }),
  getById: (id: string) => apiClient.get<ApiResponse<Staff>>(`/staff/${id}`),
  update: (id: string, data: UpdateStaffData) => apiClient.patch<ApiResponse<Staff>>(`/staff/${id}`, data),
  assignRoles: (id: string, data: AssignRolesData) => apiClient.post<ApiResponse<Staff>>(`/staff/${id}/roles`, data),
};


