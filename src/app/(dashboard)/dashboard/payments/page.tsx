'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchProperties } from '@/store/slices/propertySlice';
import { fetchPayments, createPayment, updatePayment, refundPayment } from '@/store/slices/paymentSlice';
import { useNotification } from '@/hooks/useNotification';
import type { AxiosError } from 'axios';
import { handleApiError } from '@/lib/api/error-handler';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

import {
  CreditCard,
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  DollarSign,
  RefreshCcw,
} from 'lucide-react';

export default function PaymentsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { payments, loading, pagination } = useSelector((s: RootState) => s.payment);
  const { properties } = useSelector((s: RootState) => s.property);
  const { success, error } = useNotification();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [createOpen, setCreateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [viewing, setViewing] = useState<any | null>(null);
  const [editing, setEditing] = useState<any | null>(null);

  useEffect(() => {
    if (!properties || properties.length === 0) {
      dispatch(fetchProperties({ page: 1, limit: 100 }));
    }
  }, [dispatch, properties]);

  useEffect(() => {
    dispatch(
      fetchPayments({
        page,
        limit,
        search: searchTerm || undefined,
      }),
    );
  }, [dispatch, searchTerm, page, limit]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return payments.filter((p) => {
      const propName = properties.find((x) => x.id === p.propertyId)?.name || '';
      const searchable = [
        p.reference || '',
        p.description || '',
        p.method,
        p.status,
        p.currency,
        String(p.amount),
        propName,
      ]
        .join(' ')
        .toLowerCase();
      const matchesTerm = term === '' || searchable.includes(term);
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesMethod = methodFilter === 'all' || p.method === methodFilter;
      const matchesProperty = propertyFilter === 'all' || p.propertyId === propertyFilter;
      return matchesTerm && matchesStatus && matchesMethod && matchesProperty;
    });
  }, [payments, searchTerm, statusFilter, methodFilter, propertyFilter, properties]);

  const totalAmount = filtered.reduce((sum, p) => sum + (p.amount || 0), 0);
  const refundedAmount = filtered.reduce((sum, p) => sum + (p.refundedAmount || 0), 0);

  const createFormInit = {
    propertyId: properties[0]?.id || '',
    reference: '',
    description: '',
    method: 'CASH' as const,
    currency: 'ETB',
    amount: '',
  };

  const [createForm, setCreateForm] = useState(createFormInit);
  const [editForm, setEditForm] = useState<{ reference: string; description: string; method: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'ONLINE_GATEWAY' }>({ reference: '', description: '', method: 'CASH' });
  const [refundForm, setRefundForm] = useState({ amount: '', reason: '' });

  const resetCreateForm = () => setCreateForm(createFormInit);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground mt-1">Manage payment transactions</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Payment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{pagination.total}</div>
            <p className="text-xs text-muted-foreground">All transactions</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">Sum of filtered</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Refunded</CardTitle>
            <RefreshCcw className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(refundedAmount)}</div>
            <p className="text-xs text-muted-foreground">Total refunds</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{filtered.filter((p) => p.status === 'COMPLETED').length}</div>
            <p className="text-xs text-muted-foreground">Successful payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by reference, description, amount, property"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={propertyFilter} onValueChange={setPropertyFilter}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
                <SelectItem value="PARTIALLY_REFUNDED">Partially Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="CARD">Card</SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                <SelectItem value="ONLINE_GATEWAY">Online Gateway</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Payments</CardTitle>
          <CardDescription>Manage and view all payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading payments...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((p) => (
                    <TableRow key={p.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="font-medium">{p.reference || p.id.slice(0, 8)}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[240px]">{p.description || '—'}</div>
                      </TableCell>
                      <TableCell>{properties.find((x) => x.id === p.propertyId)?.name || '—'}</TableCell>
                      <TableCell className="font-medium">{new Intl.NumberFormat('en-US', { style: 'currency', currency: p.currency || 'ETB' }).format(p.amount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{p.method}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={p.status === 'COMPLETED' ? 'default' : p.status.includes('REFUND') ? 'secondary' : 'outline'}>{p.status.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => { setViewing(p); setViewOpen(true); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => {
                            setEditing(p);
                            setEditForm({ reference: p.reference || '', description: p.description || '', method: p.method });
                            setEditOpen(true);
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => { setViewing(p); setRefundOpen(true); }}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">Page {pagination.totalPages ? page : 0} of {pagination.totalPages}{pagination.total ? ` • ${pagination.total} total` : ''}</div>
            <div className="flex items-center gap-2">
              <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                <SelectTrigger className="w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="20">20 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
              <Button variant="outline" disabled={pagination.totalPages && page >= pagination.totalPages ? true : false} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Payment */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Payment</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const payload = {
                  propertyId: createForm.propertyId || undefined,
                  reference: createForm.reference || undefined,
                  description: createForm.description || undefined,
                  method: createForm.method,
                  currency: createForm.currency,
                  amount: Number(createForm.amount),
                };
                await dispatch(createPayment(payload as any)).unwrap();
                success('Payment created');
                setCreateOpen(false);
                resetCreateForm();
                setPage(1);
                dispatch(fetchPayments({ page: 1, limit }));
              } catch (e) {
                const apiErr = handleApiError(e as AxiosError);
                error(apiErr.message);
              }
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Property</Label>
                <Select value={createForm.propertyId} onValueChange={(v) => setCreateForm((s) => ({ ...s, propertyId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reference</Label>
                <Input value={createForm.reference} onChange={(e) => setCreateForm((s) => ({ ...s, reference: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Input value={createForm.description} onChange={(e) => setCreateForm((s) => ({ ...s, description: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Method</Label>
                <Select value={createForm.method} onValueChange={(v) => setCreateForm((s) => ({ ...s, method: v as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                    <SelectItem value="ONLINE_GATEWAY">Online Gateway</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input value={createForm.currency} onChange={(e) => setCreateForm((s) => ({ ...s, currency: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input type="number" step="0.01" value={createForm.amount} onChange={(e) => setCreateForm((s) => ({ ...s, amount: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Payment */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {viewing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Reference</p>
                  <p className="font-medium">{viewing.reference || viewing.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Property</p>
                  <p className="font-medium">{properties.find((x) => x.id === viewing.propertyId)?.name || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium">{new Intl.NumberFormat('en-US', { style: 'currency', currency: viewing.currency || 'ETB' }).format(viewing.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Method</p>
                  <p className="font-medium">{viewing.method}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">{viewing.status.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(viewing.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{viewing.description || '—'}</p>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Payment */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!editing) return;
              try {
                await dispatch(updatePayment({ id: editing.id, data: { reference: editForm.reference || undefined, description: editForm.description || undefined, method: editForm.method } })).unwrap();
                success('Payment updated');
                setEditOpen(false);
                setEditing(null);
              } catch (e) {
                const apiErr = handleApiError(e as AxiosError);
                error(apiErr.message);
              }
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Reference</Label>
                <Input value={editForm.reference} onChange={(e) => setEditForm((s) => ({ ...s, reference: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Method</Label>
                <Select value={editForm.method} onValueChange={(v) => setEditForm((s) => ({ ...s, method: v as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                    <SelectItem value="ONLINE_GATEWAY">Online Gateway</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Input value={editForm.description} onChange={(e) => setEditForm((s) => ({ ...s, description: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Refund Payment */}
      <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refund Payment</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!viewing) return;
              try {
                await dispatch(refundPayment({ id: viewing.id, data: { amount: Number(refundForm.amount), reason: refundForm.reason || undefined } })).unwrap();
                success('Payment refunded');
                setRefundOpen(false);
                setViewing(null);
              } catch (e) {
                const apiErr = handleApiError(e as AxiosError);
                error(apiErr.message);
              }
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input type="number" step="0.01" value={refundForm.amount} onChange={(e) => setRefundForm((s) => ({ ...s, amount: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Reason (optional)</Label>
                <Input value={refundForm.reason} onChange={(e) => setRefundForm((s) => ({ ...s, reason: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setRefundOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary">Refund</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
