'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AxiosError } from 'axios';

import { RootState, AppDispatch } from '@/store';
import { fetchProperties } from '@/store/slices/propertySlice';
import { useNotification } from '@/hooks/useNotification';
import { handleApiError } from '@/lib/api/error-handler';
import { bedService, dormitoryService } from '@/services/room.service';
import type { Bed, Dormitory } from '@/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

import { Plus, BedDouble, Search, Edit, Eye, Trash } from 'lucide-react';

export default function BedsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { properties } = useSelector((s: RootState) => s.property);
  const { success, error } = useNotification();

  const [beds, setBeds] = useState<Bed[]>([]);
  const [dormitories, setDormitories] = useState<Dormitory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [dormitoryFilter, setDormitoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [listLoading, setListLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewingBed, setViewingBed] = useState<Bed | null>(null);
  const [editingBed, setEditingBed] = useState<Bed | null>(null);
  const [deletingBed, setDeletingBed] = useState<Bed | null>(null);

  const [totalBedsAll, setTotalBedsAll] = useState(0);
  const [availableBedsAll, setAvailableBedsAll] = useState(0);
  const [occupiedBedsAll, setOccupiedBedsAll] = useState(0);

  useEffect(() => {
    if (!properties || properties.length === 0) {
      dispatch(fetchProperties({ page: 1, limit: 100 }));
    }
  }, [dispatch, properties]);

  useEffect(() => {
    const loadDorms = async () => {
      try {
        const res = await dormitoryService.getAll({ page: 1, limit: 1000 });
        setDormitories(res.data.data || []);
      } catch (e) {
        const apiErr = handleApiError(e as AxiosError);
        error(apiErr.message);
      }
    };
    loadDorms();
  }, [error]);

  useEffect(() => {
    const loadBeds = async () => {
      try {
        setListLoading(true);
        const params: Record<string, unknown> = { page, limit };
        if (searchTerm) params.search = searchTerm;
        if (statusFilter !== 'all') params.status = statusFilter;
        if (dormitoryFilter !== 'all') params.dormitoryId = dormitoryFilter;
        if (propertyFilter !== 'all') params.propertyId = propertyFilter; // backend may support this
        const res = await bedService.getAll(params);
        let rows = res.data.data || [];
        // If backend doesn't support property filtering, apply client-side filter
        if (propertyFilter !== 'all') {
          const allowedDorms = new Set(
            dormitories.filter(d => d.propertyId === propertyFilter).map(d => d.id),
          );
          rows = rows.filter(b => allowedDorms.has(b.dormitoryId));
        }
        setBeds(rows);
        if (res.data.meta) {
          setTotal(res.data.meta.total || 0);
          setTotalPages(res.data.meta.totalPages || 0);
        }
      } catch (e) {
        const apiErr = handleApiError(e as AxiosError);
        error(apiErr.message);
      } finally {
        setListLoading(false);
      }
    };
    loadBeds();
  }, [page, limit, searchTerm, statusFilter, dormitoryFilter, propertyFilter, dormitories, error]);

  // Global stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const baseParams: Record<string, unknown> = { page: 1, limit: 1 };
        if (dormitoryFilter !== 'all') baseParams.dormitoryId = dormitoryFilter;
        if (propertyFilter !== 'all') baseParams.propertyId = propertyFilter;
        const [totalRes, availRes, occupRes] = await Promise.all([
          bedService.getAll({ ...baseParams }),
          bedService.getAll({ ...baseParams, status: 'AVAILABLE' }),
          bedService.getAll({ ...baseParams, status: 'OCCUPIED' }),
        ]);
        setTotalBedsAll(totalRes.data.meta?.total || 0);
        setAvailableBedsAll(availRes.data.meta?.total || 0);
        setOccupiedBedsAll(occupRes.data.meta?.total || 0);
      } catch (e) {
        const apiErr = handleApiError(e as AxiosError);
        error(apiErr.message);
      }
    };
    loadStats();
  }, [dormitoryFilter, propertyFilter, error]);

  const dormitoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    dormitories.forEach(d => map.set(d.id, d.name));
    return map;
  }, [dormitories]);

  const propertyNameByDormitoryId = useMemo(() => {
    const map = new Map<string, string>();
    dormitories.forEach(d => {
      const prop = properties.find(p => p.id === d.propertyId);
      if (prop) map.set(d.id, prop.name);
    });
    return map;
  }, [dormitories, properties]);

  const filteredBeds = beds.filter((bed) => {
    const term = searchTerm.trim().toLowerCase();
    const dormName = dormitoryNameById.get(bed.dormitoryId) || '';
    const propName = propertyNameByDormitoryId.get(bed.dormitoryId) || '';
    const searchable = [
      bed.number,
      bed.status,
      String(bed.basePrice),
      bed.dormitoryId,
      dormName,
      propName,
    ].join(' ').toLowerCase();
    const matchesSearch = term === '' || searchable.includes(term);
    const matchesStatus = statusFilter === 'all' || bed.status === statusFilter;
    const matchesDorm = dormitoryFilter === 'all' || bed.dormitoryId === dormitoryFilter;
    const matchesProp =
      propertyFilter === 'all' || propertyNameByDormitoryId.get(bed.dormitoryId) === properties.find(p => p.id === propertyFilter)?.name;
    return matchesSearch && matchesStatus && matchesDorm && matchesProp;
  });

  const createSchema = z.object({
    dormitoryId: z.string().min(1, 'Dormitory is required'),
    number: z.string().min(1, 'Bed number is required'),
    basePrice: z
      .string()
      .min(1, 'Base price is required')
      .refine(v => !isNaN(Number(v)) && Number(v) >= 0, 'Base price must be a number'),
    status: z.enum(['AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE', 'OUT_OF_ORDER']),
    isActive: z.boolean(),
  });
  type CreateFormValues = z.infer<typeof createSchema>;
  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      dormitoryId: '',
      number: '',
      basePrice: '0',
      status: 'AVAILABLE',
      isActive: true,
    },
  });

  const editSchema = z.object({
    dormitoryId: z.string().min(1, 'Dormitory is required'),
    number: z.string().min(1, 'Bed number is required'),
    basePrice: z
      .string()
      .min(1, 'Base price is required')
      .refine(v => !isNaN(Number(v)) && Number(v) >= 0, 'Base price must be a number'),
    status: z.enum(['AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE', 'OUT_OF_ORDER']),
    isActive: z.boolean(),
  });
  type EditFormValues = z.infer<typeof editSchema>;
  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      dormitoryId: '',
      number: '',
      basePrice: '0',
      status: 'AVAILABLE',
      isActive: true,
    },
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Beds</h1>
          <p className="text-muted-foreground mt-1">Manage individual beds in dormitories</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Bed
        </Button>
      </div>

      {/* Create Bed Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Bed</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={createForm.handleSubmit(async (values) => {
              try {
                const payload = {
                  dormitoryId: values.dormitoryId,
                  number: values.number,
                  basePrice: Number(values.basePrice),
                  status: values.status,
                  isActive: values.isActive,
                };
                const res = await bedService.create(payload);
                const created = res.data.data as Bed;
                setBeds((prev) => [created, ...prev]);
                success('Bed created');
                setCreateOpen(false);
                createForm.reset();
              } catch (e) {
                const apiErr = handleApiError(e as AxiosError);
                error(apiErr.message);
              }
            })}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dormitory</Label>
                <Select value={createForm.watch('dormitoryId')} onValueChange={(v) => createForm.setValue('dormitoryId', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select dormitory" />
                  </SelectTrigger>
                  <SelectContent>
                    {dormitories.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {createForm.formState.errors.dormitoryId && (
                  <p className="text-sm text-red-600">{createForm.formState.errors.dormitoryId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Bed Number</Label>
                <Input {...createForm.register('number')} />
                {createForm.formState.errors.number && (
                  <p className="text-sm text-red-600">{createForm.formState.errors.number.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Base Price</Label>
                <Input type="number" step="0.01" {...createForm.register('basePrice')} />
                {createForm.formState.errors.basePrice && (
                  <p className="text-sm text-red-600">{createForm.formState.errors.basePrice.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={createForm.watch('status')} onValueChange={(v) => createForm.setValue('status', v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="OCCUPIED">Occupied</SelectItem>
                    <SelectItem value="CLEANING">Cleaning</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    <SelectItem value="OUT_OF_ORDER">Out of Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 md:col-span-2">
                <Checkbox id="isActive" checked={createForm.watch('isActive')} onCheckedChange={(v) => createForm.setValue('isActive', Boolean(v))} />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary">Create Bed</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Beds</CardTitle>
            <BedDouble className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{totalBedsAll}</div>
            <p className="text-xs text-muted-foreground">All beds</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
            <BedDouble className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{availableBedsAll}</div>
            <p className="text-xs text-muted-foreground">Ready for guests</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Occupied</CardTitle>
            <BedDouble className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{occupiedBedsAll}</div>
            <p className="text-xs text-muted-foreground">Currently in use</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Occupancy Rate</CardTitle>
            <BedDouble className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{totalBedsAll > 0 ? Math.round((occupiedBedsAll / totalBedsAll) * 100) : 0}%</div>
            <p className="text-xs text-muted-foreground">Current occupancy</p>
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
                  placeholder="Search beds by any field (number, status, price, dormitory, property)"
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
            <Select value={dormitoryFilter} onValueChange={setDormitoryFilter}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Dormitory" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dormitories</SelectItem>
                {dormitories.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="OCCUPIED">Occupied</SelectItem>
                <SelectItem value="CLEANING">Cleaning</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                <SelectItem value="OUT_OF_ORDER">Out of Order</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Beds</CardTitle>
          <CardDescription>Manage and view all beds</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bed</TableHead>
                  <TableHead>Dormitory</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading beds...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredBeds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No beds found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBeds.map((bed) => (
                    <TableRow key={bed.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="font-medium">Bed {bed.number}</div>
                      </TableCell>
                      <TableCell>{dormitoryNameById.get(bed.dormitoryId) || bed.dormitoryId}</TableCell>
                      <TableCell>{propertyNameByDormitoryId.get(bed.dormitoryId) || '-'}</TableCell>
                      <TableCell className="font-medium">${'{'}bed.basePrice{'}'}</TableCell>
                      <TableCell>
                        <Badge variant={bed.status === 'AVAILABLE' ? 'default' : 'secondary'}>
                          {bed.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => { setViewingBed(bed); setViewOpen(true); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => {
                            setEditingBed(bed);
                            editForm.reset({ basePrice: String(bed.basePrice), status: bed.status });
                            setEditOpen(true);
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => { setDeletingBed(bed); setDeleteOpen(true); }}>
                            <Trash className="h-4 w-4" />
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
            <div className="text-sm text-muted-foreground">Page {totalPages ? page : 0} of {totalPages}{total ? ` • ${total} total` : ''}</div>
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
              <Button variant="outline" disabled={totalPages && page >= totalPages ? true : false} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Bed */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bed Details</DialogTitle>
          </DialogHeader>
          {viewingBed ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Bed Number</p>
                  <p className="font-medium">{viewingBed.number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dormitory</p>
                  <p className="font-medium">{dormitoryNameById.get(viewingBed.dormitoryId) || viewingBed.dormitoryId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Property</p>
                  <p className="font-medium">{propertyNameByDormitoryId.get(viewingBed.dormitoryId) || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Base Price</p>
                  <p className="font-medium">${'{'}viewingBed.basePrice{'}'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">{viewingBed.status.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="font-medium">{viewingBed.isActive ? 'Yes' : 'No'}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(viewingBed.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Updated</p>
                  <p className="font-medium">{new Date(viewingBed.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Bed */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bed</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={editForm.handleSubmit(async (values) => {
              if (!editingBed) return;
              try {
                await bedService.update(editingBed.id, {
                  dormitoryId: values.dormitoryId !== editingBed.dormitoryId ? values.dormitoryId : undefined,
                  number: values.number !== editingBed.number ? values.number : undefined,
                  basePrice: Number(values.basePrice) !== editingBed.basePrice ? Number(values.basePrice) : undefined,
                  isActive: values.isActive !== editingBed.isActive ? values.isActive : undefined,
                });
                if (values.status !== editingBed.status) {
                  await bedService.updateStatus(editingBed.id, { status: values.status });
                }
                setBeds((prev) => prev.map(b => b.id === editingBed.id ? {
                  ...b,
                  dormitoryId: values.dormitoryId,
                  number: values.number,
                  basePrice: Number(values.basePrice),
                  isActive: values.isActive,
                  status: values.status,
                } : b));
                success('Bed updated');
                setEditOpen(false);
                setEditingBed(null);
              } catch (e) {
                const apiErr = handleApiError(e as AxiosError);
                error(apiErr.message);
              }
            })}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dormitory</Label>
                <Select value={editForm.watch('dormitoryId')} onValueChange={(v) => editForm.setValue('dormitoryId', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select dormitory" />
                  </SelectTrigger>
                  <SelectContent>
                    {dormitories.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editForm.formState.errors.dormitoryId && (
                  <p className="text-sm text-red-600">{editForm.formState.errors.dormitoryId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Bed Number</Label>
                <Input {...editForm.register('number')} />
                {editForm.formState.errors.number && (
                  <p className="text-sm text-red-600">{editForm.formState.errors.number.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Base Price</Label>
                <Input type="number" step="0.01" {...editForm.register('basePrice')} />
                {editForm.formState.errors.basePrice && (
                  <p className="text-sm text-red-600">{editForm.formState.errors.basePrice.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editForm.watch('status')} onValueChange={(v) => editForm.setValue('status', v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="OCCUPIED">Occupied</SelectItem>
                    <SelectItem value="CLEANING">Cleaning</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    <SelectItem value="OUT_OF_ORDER">Out of Order</SelectItem>
                  </SelectContent>
                </Select>
                {editForm.formState.errors.status && (
                  <p className="text-sm text-red-600">{editForm.formState.errors.status.message}</p>
                )}
              </div>
              <div className="flex items-center space-x-2 md:col-span-2">
                <Checkbox id="edit-isActive" checked={editForm.watch('isActive')} onCheckedChange={(v) => editForm.setValue('isActive', Boolean(v))} />
                <Label htmlFor="edit-isActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Bed */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Bed</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this bed? This action cannot be undone.</p>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              type="button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!deletingBed) return;
                try {
                  await bedService.delete(deletingBed.id);
                  setBeds((prev) => prev.filter(b => b.id !== deletingBed.id));
                  success('Bed deleted');
                  setDeleteOpen(false);
                  setDeletingBed(null);
                } catch (e) {
                  const apiErr = handleApiError(e as AxiosError);
                  error(apiErr.message);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
