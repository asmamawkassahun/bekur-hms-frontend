import { apiClient } from '@/lib/api/axios-instance';
import { ApiResponse, QueryParams } from '@/types';
import {
  Invoice,
  CreateInvoiceData,
  UpdateInvoiceData,
  SendInvoiceData,
} from '@/types/invoice.types';

export const invoiceService = {
  create: (data: CreateInvoiceData) => apiClient.post<ApiResponse<Invoice>>('/invoices', data),
  getAll: (params?: QueryParams) => apiClient.get<ApiResponse<Invoice[]>>('/invoices', { params }),
  getById: (id: string) => apiClient.get<ApiResponse<Invoice>>(`/invoices/${id}`),
  update: (id: string, data: UpdateInvoiceData) => apiClient.patch<ApiResponse<Invoice>>(`/invoices/${id}`, data),
  send: (id: string, data: SendInvoiceData) => apiClient.post<ApiResponse<Invoice>>(`/invoices/${id}/send`, data),
  exportPdf: (id: string) => apiClient.get(`/invoices/${id}/export`, { responseType: 'blob' }),
};


