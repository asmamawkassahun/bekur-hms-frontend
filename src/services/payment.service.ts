import { apiClient } from '@/lib/api/axios-instance';
import { ApiResponse, QueryParams } from '@/types';
import {
  Payment,
  CreatePaymentData,
  UpdatePaymentData,
  RefundPaymentData,
} from '@/types/payment.types';

export const paymentService = {
  create: (data: CreatePaymentData) =>
    apiClient.post<ApiResponse<Payment>>('/payments', data),

  getAll: (params?: QueryParams) =>
    apiClient.get<ApiResponse<Payment[]>>('/payments', { params }),

  getById: (id: string) => apiClient.get<ApiResponse<Payment>>(`/payments/${id}`),

  update: (id: string, data: UpdatePaymentData) =>
    apiClient.patch<ApiResponse<Payment>>(`/payments/${id}`, data),

  refund: (id: string, data: RefundPaymentData) =>
    apiClient.post<ApiResponse<Payment>>(`/payments/${id}/refund`, data),
};


