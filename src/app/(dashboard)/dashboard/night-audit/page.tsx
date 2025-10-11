'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { NightAuditTableRow } from '@/components/features/night-audit/NightAuditTableRow';
import { NightAuditDetailDialog } from '@/components/features/night-audit/NightAuditDetailDialog';
import { NightAuditStatsCards } from '@/components/features/night-audit/NightAuditStatsCards';
import { RunNightAuditDialog } from '@/components/features/night-audit/RunNightAuditDialog';
import { SettingsForm } from '@/components/features/night-audit/SettingsForm';
import { PermissionGuard } from '@/components/guards/PermissionGuard';
import { fetchNightAudits, setFilters } from '@/store/slices/nightAuditSlice';
import { fetchProperties } from '@/store/slices/propertySlice';
import type { NightAudit, NightAuditStatus } from '@/types/night-audit.types';

export default function NightAuditTopLevelPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, meta, filters } = useSelector(
    (s: RootState) => s.nightAudit,
  );
  const { properties } = useSelector((s: RootState) => s.property);

  const [openRun, setOpenRun] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<NightAudit | null>(null);
  const [status, setStatus] = useState<NightAuditStatus | 'all'>('all');
  const [propertyId, setPropertyId] = useState<string>('');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showSettingsForm, setShowSettingsForm] = useState(false);

  const { settings } = useSelector((s: RootState) => s.nightAudit);

  // Load properties once on mount
  useEffect(() => {
    if (!properties || properties.length === 0) {
      dispatch(fetchProperties({ page: 1, limit: 100 }));
    }
  }, [dispatch, properties]);

  // Set initial propertyId when properties are loaded
  useEffect(() => {
    if (properties && properties.length > 0 && !propertyId) {
      setPropertyId(properties[0].id);
    }
  }, [properties, propertyId]);

  // Fetch night audits only when filters change
  useEffect(() => {
    if (!propertyId) return; // Don't fetch without a property selected

    const q = {
      page: filters.page || 1,
      limit: filters.limit || 10,
      sortBy: filters.sortBy || 'businessDate',
      sortOrder: filters.sortOrder || 'desc',
      propertyId: propertyId,
      status: status === 'all' ? undefined : status,
      businessDateFrom: from || undefined,
      businessDateTo: to || undefined,
    };

    // Only fetch if this is a new query or forced reload
    if (hasLoaded && JSON.stringify(filters) === JSON.stringify(q)) {
      return; // Skip if filters haven't actually changed
    }

    dispatch(setFilters(q));
    dispatch(fetchNightAudits(q));
    setHasLoaded(true);
  }, [propertyId, status, from, to]);

  const columns = useMemo(
    () => [
      { key: 'businessDate', label: 'Business Date', sortable: true },
      { key: 'status', label: 'Status', sortable: true },
      { key: 'totalRevenue', label: 'Total Revenue', sortable: true },
      {
        key: 'netAfterCommission',
        label: 'Net After Commission',
        sortable: true,
      },
      { key: 'occupancy', label: 'Occupancy' },
      { key: 'actions', label: 'Actions' },
    ],
    [],
  );

  const renderRow = (item: NightAudit) => (
    <NightAuditTableRow
      key={item.id}
      item={item}
      onView={(audit) => {
        setSelectedAudit(audit);
        setOpenDetail(true);
      }}
    />
  );

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Night Audit"
        description="End-of-day financial and operational reporting"
      >
        <PermissionGuard permission="night-audit:run">
          <Button onClick={() => setOpenRun(true)} className="cursor-pointer">
            Run Night Audit
          </Button>
        </PermissionGuard>
      </PageHeader>

      <NightAuditStatsCards />

      <DataTable<NightAudit>
        title="Night Audits"
        columns={columns}
        data={items}
        loading={Boolean(loading['list'])}
        filters={
          <div className="flex flex-wrap gap-2 w-full">
            <Select value={propertyId} onValueChange={setPropertyId}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Property" />
              </SelectTrigger>
              <SelectContent>
                {(properties || []).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as NightAuditStatus | 'all')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REOPENED">Reopened</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
        }
        renderRow={renderRow}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Property Settings</h3>
          {settings && settings.propertyId === propertyId && !showSettingsForm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettingsForm(true)}
              className="cursor-pointer"
            >
              Edit Settings
            </Button>
          )}
        </div>

        {(!settings || settings.propertyId !== propertyId || showSettingsForm) && (
          <SettingsForm
            propertyId={propertyId || null}
            onSaveSuccess={() => setShowSettingsForm(false)}
          />
        )}

        {settings && settings.propertyId === propertyId && !showSettingsForm && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/30">
            <div>
              <p className="text-sm text-muted-foreground">Day Open Time</p>
              <p className="font-medium">{settings.dayOpenTime}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Day Close Time</p>
              <p className="font-medium">{settings.dayCloseTime}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Night Audit Time</p>
              <p className="font-medium">{settings.nightAuditTime}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Check-In Time</p>
              <p className="font-medium">{settings.defaultCheckInTime}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Check-Out Time</p>
              <p className="font-medium">{settings.defaultCheckOutTime}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Auto Run Audit</p>
              <p className="font-medium">{settings.autoRunNightAudit ? 'Yes' : 'No'}</p>
            </div>
          </div>
        )}
      </div>

      <RunNightAuditDialog
        open={openRun}
        onOpenChange={setOpenRun}
        propertyId={propertyId || null}
      />
      <NightAuditDetailDialog
        open={openDetail}
        onOpenChange={setOpenDetail}
        audit={selectedAudit}
      />
    </div>
  );
}
