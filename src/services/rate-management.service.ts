import { apiClient } from '@/lib/api/axios-instance';
import type { ApiResponse } from '@/types';
import type {
  PricingRule,
  CreatePricingRuleData,
  UpdatePricingRuleData,
  PricingQuery,
} from '@/types';

export const rateManagementService = {
  createRule: (data: CreatePricingRuleData) =>
    apiClient.post<ApiResponse<PricingRule>>('/pricing/rules', data),

  getRules: (params?: PricingQuery) =>
    apiClient.get<ApiResponse<PricingRule[]>>('/pricing/rules', { params }),

  getRule: (id: string) =>
    apiClient.get<ApiResponse<PricingRule>>(`/pricing/rules/${id}`),

  updateRule: (id: string, data: UpdatePricingRuleData) =>
    apiClient.patch<ApiResponse<PricingRule>>(`/pricing/rules/${id}`, data),

  deleteRule: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/pricing/rules/${id}`),
};


