'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchProperties } from '@/store/slices/propertySlice';
import {
  fetchInvoices,
  createInvoice,
  updateInvoice,
  sendInvoice,
} from '@/store/slices/invoiceSlice';
import { useNotification } from '@/hooks/useNotification';
import type { AxiosError } from 'axios';
import { handleApiError } from '@/lib/api/error-handler';
import type {
  Invoice,
  CreateInvoiceData,
  UpdateInvoiceData,
  InvoiceItem,
} from '@/types';

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
  FileText,
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Send,
  Download,
} from 'lucide-react';

export default function InvoicesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { invoices, loading, pagination } = useSelector(
    (s: RootState) => s.invoice,
  );
  const { properties } = useSelector((s: RootState) => s.property);
  const { success, error } = useNotification();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [createOpen, setCreateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [viewing, setViewing] = useState<Invoice | null>(null);
  const [editing, setEditing] = useState<Invoice | null>(null);

  useEffect(() => {
    if (!properties || properties.length === 0) {
      dispatch(fetchProperties({ page: 1, limit: 100 }));
    }
  }, [dispatch, properties]);

  useEffect(() => {
    dispatch(
      fetchInvoices({
        page,
        limit,
        search: searchTerm || undefined,
      }),
    );
  }, [dispatch, searchTerm, page, limit]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return invoices.filter((i) => {
      const propName =
        properties.find((x) => x.id === i.propertyId)?.name || '';
      const searchable = [
        i.number,
        i.currency,
        String(i.total),
        i.status,
        propName,
      ]
        .join(' ')
        .toLowerCase();
      const matchesTerm = term === '' || searchable.includes(term);
      const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
      const matchesProperty =
        propertyFilter === 'all' || i.propertyId === propertyFilter;
      return matchesTerm && matchesStatus && matchesProperty;
    });
  }, [invoices, searchTerm, statusFilter, propertyFilter, properties]);

  const totalBilled = filtered.reduce((sum, i) => sum + (i.total || 0), 0);
  const overdueCount = filtered.filter((i) => i.status === 'OVERDUE').length;
  const paidCount = filtered.filter(
    (i) => i.status === 'PAID' || i.status === 'PARTIALLY_PAID',
  ).length;

  const [createForm, setCreateForm] = useState({
    propertyId: properties[0]?.id || '',
    currency: 'ETB',
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    taxRate: '15',
    notes: '',
    items: [{ description: '', quantity: '1', unitPrice: '0' }],
  });
  const [editForm, setEditForm] = useState({
    currency: 'ETB',
    issueDate: '',
    dueDate: '',
    taxRate: '15',
    notes: '',
  });
  const [sendForm, setSendForm] = useState({ toEmail: '', message: '' });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground mt-1">
            Generate and manage invoices for guests
          </p>
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Invoices
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {pagination.total}
            </div>
            <p className="text-xs text-muted-foreground">All invoices</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Billed
            </CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'ETB',
              }).format(totalBilled)}
            </div>
            <p className="text-xs text-muted-foreground">Sum of filtered</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paid
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {paidCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Fully/Partially paid
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue
            </CardTitle>
            <FileText className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {overdueCount}
            </div>
            <p className="text-xs text-muted-foreground">Past due date</p>
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
                  placeholder="Search by number, amount, property"
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
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Manage and view all invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading invoices...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((i) => (
                    <TableRow key={i.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="font-medium">{i.number}</div>
                        <div className="text-sm text-muted-foreground">
                          {i.currency} {i.total}
                        </div>
                      </TableCell>
                      <TableCell>
                        {properties.find((x) => x.id === i.propertyId)?.name ||
                          '—'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: i.currency || 'ETB',
                        }).format(i.total)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            i.status === 'PAID'
                              ? 'default'
                              : i.status === 'OVERDUE'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {i.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(i.issueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(i.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setViewing(i);
                              setViewOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditing(i);
                              setEditForm({
                                currency: i.currency,
                                issueDate: i.issueDate.slice(0, 10),
                                dueDate: i.dueDate.slice(0, 10),
                                taxRate: String(i.taxRate || 0),
                                notes: i.notes || '',
                              });
                              setEditOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setViewing(i);
                              setSendOpen(true);
                            }}
                          >
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
            <div className="text-sm text-muted-foreground">
              Page {pagination.totalPages ? page : 0} of {pagination.totalPages}
              {pagination.total ? ` • ${pagination.total} total` : ''}
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={String(limit)}
                onValueChange={(v) => {
                  setLimit(Number(v));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="20">20 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={
                  pagination.totalPages && page >= pagination.totalPages
                    ? true
                    : false
                }
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Invoice */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const payload: CreateInvoiceData = {
                  propertyId: createForm.propertyId || undefined,
                  currency: createForm.currency,
                  issueDate: createForm.issueDate,
                  dueDate: createForm.dueDate,
                  taxRate: Number(createForm.taxRate || '0'),
                  notes: createForm.notes || undefined,
                  items: createForm.items.map((it) => ({
                    description: it.description,
                    quantity: Number(it.quantity),
                    unitPrice: Number(it.unitPrice),
                  })),
                };
                await dispatch(createInvoice(payload)).unwrap();
                success('Invoice created');
                setCreateOpen(false);
                setCreateForm({
                  ...createForm,
                  items: [{ description: '', quantity: '1', unitPrice: '0' }],
                });
                setPage(1);
                dispatch(fetchInvoices({ page: 1, limit }));
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
                <Select
                  value={createForm.propertyId}
                  onValueChange={(v) =>
                    setCreateForm((s) => ({ ...s, propertyId: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input
                  value={createForm.currency}
                  onChange={(e) =>
                    setCreateForm((s) => ({ ...s, currency: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Issue Date</Label>
                <Input
                  type="date"
                  value={createForm.issueDate}
                  onChange={(e) =>
                    setCreateForm((s) => ({ ...s, issueDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={createForm.dueDate}
                  onChange={(e) =>
                    setCreateForm((s) => ({ ...s, dueDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Items</Label>
                {createForm.items.map((it, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2"
                  >
                    <Input
                      placeholder="Description"
                      value={it.description}
                      onChange={(e) =>
                        setCreateForm((s) => {
                          const items = [...s.items];
                          items[idx].description = e.target.value;
                          return { ...s, items };
                        })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={it.quantity}
                      onChange={(e) =>
                        setCreateForm((s) => {
                          const items = [...s.items];
                          items[idx].quantity = e.target.value;
                          return { ...s, items };
                        })
                      }
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Unit Price"
                      value={it.unitPrice}
                      onChange={(e) =>
                        setCreateForm((s) => {
                          const items = [...s.items];
                          items[idx].unitPrice = e.target.value;
                          return { ...s, items };
                        })
                      }
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setCreateForm((s) => ({
                      ...s,
                      items: [
                        ...s.items,
                        { description: '', quantity: '1', unitPrice: '0' },
                      ],
                    }))
                  }
                >
                  Add Item
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={createForm.taxRate}
                  onChange={(e) =>
                    setCreateForm((s) => ({ ...s, taxRate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Notes</Label>
                <Input
                  value={createForm.notes}
                  onChange={(e) =>
                    setCreateForm((s) => ({ ...s, notes: e.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-primary">
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Invoice */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {viewing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Invoice Number
                  </p>
                  <p className="font-medium">{viewing.number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Property</p>
                  <p className="font-medium">
                    {properties.find((x) => x.id === viewing.propertyId)
                      ?.name || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-medium">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: viewing.currency || 'ETB',
                    }).format(viewing.total)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">
                    {viewing.status.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Issue Date</p>
                  <p className="font-medium">
                    {new Date(viewing.issueDate).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">
                    {new Date(viewing.dueDate).toLocaleString()}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Items</p>
                {viewing.items?.length ? (
                  <div className="space-y-1">
                    {viewing.items.map((it: InvoiceItem, idx: number) => (
                      <div key={idx} className="text-sm flex justify-between">
                        <span>
                          {it.description} x {it.quantity}
                        </span>
                        <span>
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: viewing.currency || 'ETB',
                          }).format(it.unitPrice * it.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No items</p>
                )}
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setViewOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Invoice */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!editing) return;
              try {
                await dispatch(
                  updateInvoice({
                    id: editing.id,
                    data: {
                      currency: editForm.currency,
                      issueDate: editForm.issueDate,
                      dueDate: editForm.dueDate,
                      taxRate: Number(editForm.taxRate || '0'),
                      notes: editForm.notes || undefined,
                    },
                  }),
                ).unwrap();
                success('Invoice updated');
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
                <Label>Currency</Label>
                <Input
                  value={editForm.currency}
                  onChange={(e) =>
                    setEditForm((s) => ({ ...s, currency: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Issue Date</Label>
                <Input
                  type="date"
                  value={editForm.issueDate}
                  onChange={(e) =>
                    setEditForm((s) => ({ ...s, issueDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) =>
                    setEditForm((s) => ({ ...s, dueDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.taxRate}
                  onChange={(e) =>
                    setEditForm((s) => ({ ...s, taxRate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Notes</Label>
                <Input
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm((s) => ({ ...s, notes: e.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-primary">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Send Invoice */}
      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Invoice</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!viewing) return;
              try {
                await dispatch(
                  sendInvoice({
                    id: viewing.id,
                    data: {
                      toEmail: sendForm.toEmail,
                      message: sendForm.message || undefined,
                    },
                  }),
                ).unwrap();
                success('Invoice sent');
                setSendOpen(false);
                setViewing(null);
              } catch (e) {
                const apiErr = handleApiError(e as AxiosError);
                error(apiErr.message);
              }
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Recipient Email</Label>
                <Input
                  type="email"
                  value={sendForm.toEmail}
                  onChange={(e) =>
                    setSendForm((s) => ({ ...s, toEmail: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Message (optional)</Label>
                <Input
                  value={sendForm.message}
                  onChange={(e) =>
                    setSendForm((s) => ({ ...s, message: e.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSendOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-primary">
                <Send className="mr-2 h-4 w-4" />
                Send
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
