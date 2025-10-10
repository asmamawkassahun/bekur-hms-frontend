// Aiosell Channel Manager Types

export interface AiosellSyncLog {
  id: string;
  propertyId: string;
  syncType: 'INVENTORY' | 'RATES' | 'RESTRICTIONS' | 'BOOKING' | 'NOSHOW';
  direction: 'INBOUND' | 'OUTBOUND';
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  aiosellPayload: Record<string, unknown>;
  systemData: Record<string, unknown>;
  errorMessage: string | null;
  retryCount: number;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
  property?: {
    id: string;
    name: string;
    hotelCode: string | null;
  };
}

export interface AiosellSyncStatus {
  total: number;
  successful: number;
  failed: number;
  pending: number;
  successRate: number;
  lastSuccessfulSync: string | null;
}

export interface SyncDateRange {
  startDate: string; // Format: YYYY-MM-DD
  endDate: string; // Format: YYYY-MM-DD
}

export interface AiosellSyncLogQuery {
  propertyId?: string;
  syncType?:
    | 'INVENTORY'
    | 'RATES'
    | 'RESTRICTIONS'
    | 'BOOKING'
    | 'NOSHOW'
    | 'all';
  status?: 'SUCCESS' | 'FAILED' | 'PENDING' | 'all';
  direction?: 'INBOUND' | 'OUTBOUND' | 'all';
  page?: number;
  limit?: number;
}
