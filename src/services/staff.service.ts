import { apiClient } from '@/lib/api/axios-instance';
import { ApiResponse, QueryParams } from '@/types';
import { Staff, CreateStaffData, UpdateStaffData, AssignRolesData, CreateUserData } from '@/types/staff.types';

export const staffService = {
  // User management
  createUser: (data: CreateUserData) => apiClient.post<ApiResponse<{ id: string; message: string }>>('/auth/signup', data),
  
  // Staff management
  create: (data: CreateStaffData) => apiClient.post<ApiResponse<Staff>>('/staff', data),
  getAll: (params?: QueryParams) => apiClient.get<ApiResponse<Staff[]>>('/staff', { params }),
  getById: (id: string) => apiClient.get<ApiResponse<Staff>>(`/staff/${id}`),
  update: (id: string, data: UpdateStaffData) => apiClient.patch<ApiResponse<Staff>>(`/staff/${id}`, data),
  delete: (id: string) => apiClient.delete<ApiResponse<{ message: string }>>(`/staff/${id}`),
  
  // Role management
  assignRole: (id: string, data: AssignRolesData) => apiClient.post<ApiResponse<Staff>>(`/staff/${id}/roles`, data),
  removeRole: (id: string, roleId: string) => apiClient.delete<ApiResponse<Staff>>(`/staff/${id}/roles/${roleId}`),
  
  // Property management
  assignProperty: (id: string, data: { propertyId: string }) => apiClient.post<ApiResponse<Staff>>(`/staff/${id}/properties`, data),
  removeProperty: (id: string, propertyId: string) => apiClient.delete<ApiResponse<Staff>>(`/staff/${id}/properties/${propertyId}`),
};


