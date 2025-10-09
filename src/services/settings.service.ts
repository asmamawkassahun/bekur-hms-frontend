import { apiClient } from '@/lib/api/axios-instance';
import { ApiResponse } from '@/types';
import type { Settings, UpdateSettingsData } from '@/types/settings.types';

export const settingsService = {
  get: () => apiClient.get<ApiResponse<Settings>>('/settings'),
  update: (data: UpdateSettingsData) => apiClient.patch<ApiResponse<Settings>>('/settings', data),
};


