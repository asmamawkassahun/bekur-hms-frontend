import { apiClient } from '@/lib/api/axios-instance';
import type { ApiResponse } from '@/types';
import type {
  AiosellSyncLog,
  AiosellSyncStatus,
  SyncDateRange,
  AiosellSyncLogQuery,
} from '@/types/aiosell.types';

export const aiosellService = {
  /**
   * Trigger manual inventory sync for a property
   */
  triggerInventorySync: (propertyId: string, dateRange?: SyncDateRange) =>
    apiClient.post<ApiResponse<void>>(
      `/aiosell/sync/inventory/${propertyId}`,
      dateRange,
    ),

  /**
   * Trigger manual rate sync for a property
   */
  triggerRateSync: (propertyId: string, dateRange?: SyncDateRange) =>
    apiClient.post<ApiResponse<void>>(
      `/aiosell/sync/rates/${propertyId}`,
      dateRange,
    ),

  /**
   * Trigger full sync (inventory + rates) for next 12 months
   */
  triggerFullSync: (propertyId: string) =>
    apiClient.post<ApiResponse<void>>(`/aiosell/sync/full/${propertyId}`),

  /**
   * Get sync logs with optional filters
   */
  getSyncLogs: (params: AiosellSyncLogQuery) =>
    apiClient.get<ApiResponse<AiosellSyncLog[]>>('/aiosell/sync-logs', {
      params,
    }),

  /**
   * Get sync status for a property
   */
  getSyncStatus: (propertyId: string) =>
    apiClient.get<ApiResponse<AiosellSyncStatus>>(
      `/aiosell/sync-status/${propertyId}`,
    ),
};
