'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { aiosellService } from '@/services/aiosell.service';
import type { AiosellSyncStatus } from '@/types/aiosell.types';

interface PropertySyncStatusProps {
  propertyId: string;
}

export function PropertySyncStatus({ propertyId }: PropertySyncStatusProps) {
  const [status, setStatus] = useState<AiosellSyncStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStatus = async () => {
    try {
      const response = await aiosellService.getSyncStatus(propertyId);
      setStatus(response.data.data);
    } catch (error) {
      console.error('Failed to load sync status', error);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-muted-foreground">No data</span>
      </div>
    );
  }

  const isHealthy = status.successRate >= 95;

  return (
    <div className="flex items-center gap-2">
      {isHealthy ? (
        <>
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium">Healthy</span>
        </>
      ) : (
        <>
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <span className="text-sm font-medium">Issues</span>
        </>
      )}
      <span className="text-xs text-muted-foreground">
        ({status.successRate.toFixed(1)}%)
      </span>
    </div>
  );
}
