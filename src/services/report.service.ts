import { apiClient } from '@/lib/api/axios-instance';
import type { ApiResponse } from '@/types';
import type {
  ReportsSummary,
  ReportsQueryParams,
  GenerateReportDto,
  ReportQueryDto,
  ReportResponse,
  ReportsListResponse,
  OccupancyReportData,
  RevenueReportData,
  OperationalReportData,
  FinancialReportData,
  GuestAnalyticsReportData,
} from '@/types/report.types';

export const reportService = {
  // Legacy summary endpoint
  getSummary: (params?: ReportsQueryParams) =>
    apiClient.get<ApiResponse<ReportsSummary>>('/reports/summary', { params }),

  // Report generation endpoints
  generateReport: (data: GenerateReportDto) =>
    apiClient.post<ApiResponse<ReportResponse>>('/reports/generate', data),

  generateOccupancyReport: (data: Omit<GenerateReportDto, 'type'>) =>
    apiClient.post<ApiResponse<ReportResponse>>('/reports/occupancy', data),

  generateRevenueReport: (data: Omit<GenerateReportDto, 'type'>) =>
    apiClient.post<ApiResponse<ReportResponse>>('/reports/revenue', data),

  generateOperationalReport: (data: Omit<GenerateReportDto, 'type'>) =>
    apiClient.post<ApiResponse<ReportResponse>>('/reports/operational', data),

  generateFinancialReport: (data: Omit<GenerateReportDto, 'type'>) =>
    apiClient.post<ApiResponse<ReportResponse>>('/reports/financial', data),

  generateGuestAnalyticsReport: (data: Omit<GenerateReportDto, 'type'>) =>
    apiClient.post<ApiResponse<ReportResponse>>('/reports/guest-analytics', data),

  // Saved reports management
  listReports: (params?: ReportQueryDto) =>
    apiClient.get<ReportsListResponse>('/reports', { params }),

  getReportById: (id: string) =>
    apiClient.get<ReportResponse>(`/reports/${id}`),

  deleteReport: (id: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(`/reports/${id}`),

  // Export functionality
  exportPdf: (params?: ReportsQueryParams) =>
    apiClient.get('/reports/export/pdf', { params, responseType: 'blob' }),

  exportExcel: (params?: ReportsQueryParams) =>
    apiClient.get('/reports/export/excel', { params, responseType: 'blob' }),
};


