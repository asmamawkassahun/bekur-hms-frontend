'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Filter } from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';
import type { AxiosError } from 'axios';
import { handleApiError } from '@/lib/api/error-handler';
import type { PricingRule, PricingRuleType } from '@/types';

import { PageHeader } from '@/components/shared/PageHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PermissionGuard } from '@/components/guards/PermissionGuard';

import { PricingStatsCards } from '@/components/features/rate-management/PricingStatsCards';
import { PricingRuleTableRow } from '@/components/features/rate-management/PricingRuleTableRow';
import { PricingRuleForm } from '@/components/features/rate-management/PricingRuleForm';

import {
  fetchPricingRules,
  createPricingRule,
  updatePricingRule,
  deletePricingRule,
} from '@/store/slices/rateManagementSlice';

export default function RateManagementPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { rules, loading, pagination, searchCache, lastSearchTerm, isSearching } = useSelector(
    (state: RootState) => state.rateManagement,
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | PricingRuleType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedRule, setSelectedRule] = useState<PricingRule | null>(null);

  const { success, error } = useNotification();

  const extractErrorMessage = (e: unknown) =>
    typeof e === 'string' ? e : handleApiError(e as AxiosError).message;

  useEffect(() => {
    dispatch(fetchPricingRules({ page: 1, limit: 10 }));
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    dispatch(
      fetchPricingRules({
        page: 1,
        limit: 10,
        search: debouncedSearch || undefined,
        type: typeFilter === 'all' ? undefined : typeFilter,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
      }),
    );
  }, [dispatch, debouncedSearch, typeFilter, statusFilter]);

  const handleCreate = async (data: any) => {
    try {
      await dispatch(createPricingRule(data)).unwrap();
      success('Rule created');
      setOpenCreate(false);
      dispatch(
        fetchPricingRules({
          page: 1,
          limit: 10,
          search: debouncedSearch || undefined,
          type: typeFilter === 'all' ? undefined : typeFilter,
          isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
        }),
      );
    } catch (e) {
      error(extractErrorMessage(e));
    }
  };

  const handleEdit = async (data: any) => {
    if (!selectedRule) return;
    try {
      await dispatch(updatePricingRule({ id: selectedRule.id, data })).unwrap();
      success('Rule updated');
      setOpenEdit(false);
      setSelectedRule(null);
      dispatch(
        fetchPricingRules({
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearch || undefined,
          type: typeFilter === 'all' ? undefined : typeFilter,
          isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
        }),
      );
    } catch (e) {
      error(extractErrorMessage(e));
    }
  };

  const handleDelete = async () => {
    if (!selectedRule) return;
    try {
      await dispatch(deletePricingRule(selectedRule.id)).unwrap();
      success('Rule deleted');
      setOpenDelete(false);
      setSelectedRule(null);
      // Optimistic local update to avoid stale row
      dispatch(
        fetchPricingRules({
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearch || undefined,
          type: typeFilter === 'all' ? undefined : typeFilter,
          isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
        }),
      );
    } catch (e) {
      error(extractErrorMessage(e));
    }
  };

  const columns = [
    { key: 'name', label: 'Rule', width: 'w-[220px]' },
    { key: 'type', label: 'Type', width: 'w-[150px]' },
    { key: 'dates', label: 'Date Range', width: 'w-[220px]' },
    { key: 'priority', label: 'Priority', width: 'w-[100px]' },
    { key: 'isActive', label: 'Status', width: 'w-[100px]' },
    { key: 'actions', label: 'Actions', width: 'w-[120px]', sortable: false },
  ];

  const renderRuleRow = (rule: PricingRule) => (
    <PricingRuleTableRow
      key={rule.id}
      rule={rule}
      onView={(r) => {
        setSelectedRule(r);
        setOpenView(true);
      }}
      onEdit={(r) => {
        setSelectedRule(r);
        setOpenEdit(true);
      }}
      onDelete={(r) => {
        setSelectedRule(r);
        setOpenDelete(true);
      }}
    />
  );

  const renderConfigSection = (rule: PricingRule) => {
    const cfg: any = rule.config || {};

    const Section = ({ children }: { children: React.ReactNode }) => (
      <div className="rounded-md border overflow-x-auto">
        <div className="min-w-full">{children}</div>
      </div>
    );

    if (rule.type === 'SEASONAL') {
      return (
        <Section>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b">
                <td className="p-3 text-muted-foreground w-48">Multiplier</td>
                <td className="p-3 font-medium">{cfg.multiplier ?? '-'}</td>
              </tr>
            </tbody>
          </table>
        </Section>
      );
    }

    if (rule.type === 'DAY_OF_WEEK') {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const days: Array<{ day: string; multiplier: number }> = [];
      for (let i = 0; i < 7; i++) {
        const d = cfg.days?.[i];
        if (d && typeof d.multiplier === 'number') {
          days.push({ day: dayNames[i], multiplier: d.multiplier });
        }
      }
      return (
        <Section>
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3">Day</th>
                <th className="text-left p-3">Multiplier</th>
              </tr>
            </thead>
            <tbody>
              {days.length === 0 ? (
                <tr>
                  <td className="p-3 text-muted-foreground" colSpan={2}>No day overrides</td>
                </tr>
              ) : (
                days.map((d) => (
                  <tr key={d.day} className="border-b">
                    <td className="p-3">{d.day}</td>
                    <td className="p-3 font-medium">{d.multiplier}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Section>
      );
    }

    if (rule.type === 'PROMOTIONAL' || rule.type === 'EARLY_BIRD' || rule.type === 'LAST_MINUTE' || rule.type === 'PACKAGE') {
      return (
        <Section>
          <table className="w-full text-sm">
            <tbody>
              {'discountPercent' in cfg && (
                <tr className="border-b">
                  <td className="p-3 text-muted-foreground w-48">Discount %</td>
                  <td className="p-3 font-medium">{cfg.discountPercent}</td>
                </tr>
              )}
              {rule.type === 'EARLY_BIRD' && 'minDays' in cfg && (
                <tr className="border-b">
                  <td className="p-3 text-muted-foreground w-48">Min Days</td>
                  <td className="p-3 font-medium">{cfg.minDays}</td>
                </tr>
              )}
              {rule.type === 'LAST_MINUTE' && 'maxDays' in cfg && (
                <tr className="border-b">
                  <td className="p-3 text-muted-foreground w-48">Max Days</td>
                  <td className="p-3 font-medium">{cfg.maxDays}</td>
                </tr>
              )}
              {rule.type === 'PACKAGE' && 'minNights' in cfg && (
                <tr className="border-b">
                  <td className="p-3 text-muted-foreground w-48">Min Nights</td>
                  <td className="p-3 font-medium">{cfg.minNights}</td>
                </tr>
              )}
            </tbody>
          </table>
        </Section>
      );
    }

    if (rule.type === 'OCCUPANCY_BASED') {
      const thresholds: Array<{ min: number; max: number; modifier: number }> = cfg.thresholds || [];
      return (
        <div className="space-y-3">
          <Section>
            <table className="w-full text-sm">
              <tbody>
                {'propertyId' in cfg && (
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground w-48">Property ID</td>
                    <td className="p-3 font-medium break-words">{cfg.propertyId}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Section>
          <Section>
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3">Min %</th>
                  <th className="text-left p-3">Max %</th>
                  <th className="text-left p-3">Modifier %</th>
                </tr>
              </thead>
              <tbody>
                {thresholds.length === 0 ? (
                  <tr>
                    <td className="p-3 text-muted-foreground" colSpan={3}>No thresholds configured</td>
                  </tr>
                ) : (
                  thresholds.map((t, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-3">{t.min}</td>
                      <td className="p-3">{t.max}</td>
                      <td className="p-3">{t.modifier}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Section>
        </div>
      );
    }

    return (
      <Section>
        <table className="w-full text-sm">
          <tbody>
            <tr>
              <td className="p-3 text-muted-foreground">Config</td>
              <td className="p-3 font-medium">-</td>
            </tr>
          </tbody>
        </table>
      </Section>
    );
  };

  return (
    <PermissionGuard permission="pricing:read">
      <div className="p-6 space-y-6">
        <PageHeader title="Rate Management" description="Manage dynamic rates and rules">
          <div className="flex items-center gap-2">
            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
                  <Plus className="mr-2 h-4 w-4" />
                  New Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="!w-[90vw] !max-w-[1000px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>New Rule</DialogTitle>
                </DialogHeader>
                <PricingRuleForm onSubmit={handleCreate} onCancel={() => setOpenCreate(false)} loading={loading} />
              </DialogContent>
            </Dialog>
          </div>
        </PageHeader>

        <PricingStatsCards rules={rules} />

        <DataTable
          title="Rate Management Rules"
          description="Configure and manage dynamic rates"
          columns={columns}
          data={rules || []}
          loading={loading}
          emptyMessage="No rate rules found"
          searchBar={
            <SearchBar
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={setSearchTerm}
              loading={isSearching}
            />
          }
          filters={
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Rule Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="OCCUPANCY_BASED">Occupancy Based</SelectItem>
                  <SelectItem value="SEASONAL">Seasonal</SelectItem>
                  <SelectItem value="DAY_OF_WEEK">Day Of Week</SelectItem>
                  <SelectItem value="PROMOTIONAL">Promotional</SelectItem>
                  <SelectItem value="EARLY_BIRD">Early Bird</SelectItem>
                  <SelectItem value="LAST_MINUTE">Last Minute</SelectItem>
                  <SelectItem value="PACKAGE">Package</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="flex items-center gap-2 cursor-pointer">
                <Filter className="h-4 w-4" /> More Filters
              </Button>
            </div>
          }
          renderRow={renderRuleRow}
        />

        <Dialog
          open={openEdit}
          onOpenChange={(open) => {
            setOpenEdit(open);
            if (!open) setSelectedRule(null);
          }}
        >
          <DialogContent className="!w-[90vw] !max-w-[1000px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Rule</DialogTitle>
            </DialogHeader>
            {selectedRule && (
              <PricingRuleForm
                rule={selectedRule}
                onSubmit={handleEdit}
                onCancel={() => setOpenEdit(false)}
                loading={loading}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* View Rule Dialog */}
        <Dialog
          open={openView}
          onOpenChange={(open) => {
            setOpenView(open);
            if (!open) setSelectedRule(null);
          }}
        >
          <DialogContent className="!w-[90vw] !max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Rule Details</DialogTitle>
            </DialogHeader>
            {selectedRule && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Name</div>
                    <div className="font-medium">{selectedRule.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Description</div>
                    <div className="font-medium break-words">{selectedRule.description || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Type</div>
                    <div className="font-medium">{selectedRule.type.replaceAll('_', ' ')}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Property</div>
                    <div className="font-medium">{selectedRule.property?.name || selectedRule.propertyId}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Priority</div>
                    <div className="font-medium">{selectedRule.priority}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div className="font-medium">{selectedRule.isActive ? 'Active' : 'Inactive'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Date Range</div>
                    <div className="font-medium">
                      {new Date(selectedRule.startDate).toLocaleDateString()} — {selectedRule.endDate ? new Date(selectedRule.endDate).toLocaleDateString() : 'Open'}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-2">Config</div>
                  {renderConfigSection(selectedRule)}
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setOpenView(false)} className="cursor-pointer">Close</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={openDelete}
          onOpenChange={(open) => {
            setOpenDelete(open);
            if (!open) setSelectedRule(null);
          }}
          title="Delete Rule"
          description={`Are you sure you want to delete ${selectedRule ? selectedRule.name : 'this rule'}? This action cannot be undone.`}
          confirmText="Delete"
          variant="destructive"
          onConfirm={handleDelete}
          loading={loading}
        />

      </div>
    </PermissionGuard>
  );
}
 


