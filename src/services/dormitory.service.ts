import { apiClient } from '@/lib/api/axios-instance';
import { ApiResponse, DailyDormitoryOccupancy } from '../types';

export const dormitoryService = {
  getOccupancyCalendar: (params: { propertyId: string; year: number; month: number }) =>
    apiClient.get<ApiResponse<DailyDormitoryOccupancy[]>>('/dormitories/occupancy-calendar', { params }),
};
