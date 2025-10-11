import { apiClient } from '@/lib/api/axios-instance';
import type { ApiResponse } from '@/types/api.types';
import type {
  NightAudit,
  NightAuditQueryParams,
  NightAuditListResponse,
  RunNightAuditPayload,
  ApproveNightAuditPayload,
  PropertySettings,
} from '@/types/night-audit.types';

export const nightAuditService = {
  run: (data: RunNightAuditPayload) =>
    apiClient.post<ApiResponse<NightAudit>>('/night-audit/run', data),

  list: (params?: NightAuditQueryParams) =>
    apiClient.get<NightAuditListResponse>('/night-audit', { params }),

  getCurrent: (propertyId: string) =>
    apiClient.get<ApiResponse<{ businessDate: string; isWithinBusinessHours: boolean }>>(
      `/night-audit/current/${propertyId}`,
    ),

  getByDate: (propertyId: string, businessDate: string) =>
    apiClient.get<ApiResponse<NightAudit>>(
      `/night-audit/property/${propertyId}/date/${businessDate}`,
    ),

  getOne: (id: string) =>
    apiClient.get<ApiResponse<NightAudit>>(`/night-audit/${id}`),

  approve: (id: string, data: ApproveNightAuditPayload) =>
    apiClient.post<ApiResponse<NightAudit>>(`/night-audit/${id}/approve`, data),

  reopen: (id: string) =>
    apiClient.post<ApiResponse<NightAudit>>(`/night-audit/${id}/reopen`),

  remove: (id: string) => apiClient.delete<ApiResponse<null>>(`/night-audit/${id}`),

  getSettings: (propertyId: string) =>
    apiClient.get<ApiResponse<PropertySettings>>(`/night-audit/settings/${propertyId}`),

  updateSettings: (propertyId: string, data: Partial<PropertySettings>) =>
    apiClient.patch<ApiResponse<PropertySettings>>(
      `/night-audit/settings/${propertyId}`,
      data,
    ),
};


