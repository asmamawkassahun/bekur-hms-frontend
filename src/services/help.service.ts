import { apiClient } from '@/lib/api/axios-instance';
import { ApiResponse } from '@/types';
import type { SystemStatus, SupportTicketPayload, SupportTicketResponse } from '@/types/help.types';

export const helpService = {
  // Adjust endpoints to your backend; these are conventional defaults
  getSystemStatus: () => apiClient.get<ApiResponse<SystemStatus>>('/system/status'),
  submitSupportRequest: (payload: SupportTicketPayload) =>
    apiClient.post<ApiResponse<SupportTicketResponse>>('/support/requests', payload),
};


