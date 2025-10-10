'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw } from 'lucide-react';
import { aiosellService } from '@/services/aiosell.service';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { SyncLogTableRow } from '@/components/features/aiosell/SyncLogTableRow';
import type { AiosellSyncLog } from '@/types/aiosell.types';

export default function AiosellLogsPage() {
  const [logs, setLogs] = useState<AiosellSyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    syncType: 'all',
    status: 'all',
    direction: 'all',
    page: 1,
    limit: 20,
  });

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      // Convert 'all' to undefined for API
      const apiParams: Record<string, unknown> = { ...params };
      if (params.syncType === 'all') delete apiParams.syncType;
      if (params.status === 'all') delete apiParams.status;
      if (params.direction === 'all') delete apiParams.direction;

      const response = await aiosellService.getSyncLogs(apiParams);
      setLogs(response.data.data || []);
    } catch (error) {
      console.error('Failed to load logs', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleRefresh = () => {
    loadLogs();
  };

  const columns = [
    { key: 'time', label: 'Time', width: 'w-[150px]' },
    { key: 'property', label: 'Property', width: 'w-[180px]' },
    { key: 'type', label: 'Type', width: 'w-[120px]' },
    { key: 'direction', label: 'Direction', width: 'w-[120px]' },
    { key: 'status', label: 'Status', width: 'w-[100px]' },
    { key: 'details', label: 'Details', width: 'w-[100px]', sortable: false },
  ];

  const renderLogRow = (log: AiosellSyncLog) => (
    <SyncLogTableRow key={log.id} log={log} />
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Sync Logs"
        description="Monitor all Aiosell synchronization operations"
      >
        <Button onClick={handleRefresh} variant="outline" className="cursor-pointer">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </PageHeader>

      {/* Data Table with Filters */}
      <DataTable
        title="Synchronization Logs"
        description="View and filter all sync operations"
        columns={columns}
        data={logs}
        loading={loading}
        emptyMessage="No sync logs found"
        filters={
          <div className="flex flex-col sm:flex-row gap-4">
            <Select
              value={filters.syncType}
              onValueChange={(value) =>
                setFilters({ ...filters, syncType: value, page: 1 })
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sync Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="INVENTORY">Inventory</SelectItem>
                <SelectItem value="RATES">Rates</SelectItem>
                <SelectItem value="BOOKING">Booking</SelectItem>
                <SelectItem value="RESTRICTIONS">Restrictions</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value, page: 1 })
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.direction}
              onValueChange={(value) =>
                setFilters({ ...filters, direction: value, page: 1 })
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Directions</SelectItem>
                <SelectItem value="INBOUND">Inbound (OTA → PMS)</SelectItem>
                <SelectItem value="OUTBOUND">Outbound (PMS → OTA)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
        renderRow={renderLogRow}
      />
    </div>
  );
}
