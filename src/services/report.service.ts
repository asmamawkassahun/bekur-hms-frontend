import { apiClient } from '@/lib/api/axios-instance';
import type { ApiResponse } from '@/types';
import type { ReportsSummary, ReportsQueryParams } from '@/types/report.types';

export const reportService = {
  getSummary: (params?: ReportsQueryParams) =>
    apiClient.get<ApiResponse<ReportsSummary>>('/reports/summary', { params }),
  exportPdf: (params?: ReportsQueryParams) =>
    apiClient.get('/reports/export/pdf', { params, responseType: 'blob' }),
  exportExcel: (params?: ReportsQueryParams) =>
    apiClient.get('/reports/export/excel', { params, responseType: 'blob' }),
};


