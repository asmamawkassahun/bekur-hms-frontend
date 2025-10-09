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
import { dormitoryService } from '@/services/room.service';
import type { Dormitory } from '@/types';

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

import { Plus, Home, Search, Edit, Eye, Trash } from 'lucide-react';

export default function DormitoriesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { properties } = useSelector((s: RootState) => s.property);
  const { success, error } = useNotification();

  const [dormitories, setDormitories] = useState<Dormitory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState("all");
  const [isActiveFilter, setIsActiveFilter] = useState('all'); // 'all' | 'true' | 'false'
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [listLoading, setListLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewing, setViewing] = useState<Dormitory | null>(null);
  const [editing, setEditing] = useState<Dormitory | null>(null);
  const [deleting, setDeleting] = useState<Dormitory | null>(null);

  const [totalAll, setTotalAll] = useState(0);
  const [availableAll, setAvailableAll] = useState(0);
  const [occupiedAll, setOccupiedAll] = useState(0);

  useEffect(() => {
    if (!properties || properties.length === 0) {
      dispatch(fetchProperties({ page: 1, limit: 100 }));
    }
  }, [dispatch, properties]);

  useEffect(() => {
    const loadDorms = async () => {
      try {
        setListLoading(true);
        const params: Record<string, unknown> = { page, limit };
        if (searchTerm) params.search = searchTerm;
        if (propertyFilter !== 'all') params.propertyId = propertyFilter;
        if (typeFilter !== 'all') params.type = typeFilter;
        if (isActiveFilter !== 'all') params.isActive = isActiveFilter === 'true';
        const res = await dormitoryService.getAll(params);
        setDormitories(res.data.data || []);
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
    loadDorms();
  }, [page, limit, searchTerm, propertyFilter, typeFilter, isActiveFilter, error]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const base: Record<string, unknown> = { page: 1, limit: 10 };
        if (propertyFilter !== 'all') base.propertyId = propertyFilter;
        if (typeFilter !== 'all') base.type = typeFilter;
        if (isActiveFilter !== 'all') base.isActive = isActiveFilter === 'true';
        // Use a single request to get total matching dormitories based on filters
        const allRes = await dormitoryService.getAll(base);
        setTotalAll(allRes.data.meta?.total || 0);
        // Note: available/occupied counts depend on bed occupancy, not dormitory itself.
        // Leaving existing values as-is; can compute from bedService if needed.
      } catch (e) {
        const apiErr = handleApiError(e as AxiosError);
        error(apiErr.message);
      }
    };
    loadStats();
  }, [propertyFilter, typeFilter, isActiveFilter, error]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return dormitories.filter((d) => {
      const propName = properties.find(p => p.id === d.propertyId)?.name || '';
      const searchable = [
        d.name,
        d.type,
        String(d.capacity),
        String(d.basePrice),
        propName,
        ...d.amenities,
      ].join(' ').toLowerCase();
      const matchesSearch = term === '' || searchable.includes(term);
      const matchesProp = propertyFilter === 'all' || d.propertyId === propertyFilter;
      const matchesType = typeFilter === 'all' || d.type === typeFilter;
      const matchesActive = isActiveFilter === 'all' || d.isActive === (isActiveFilter === 'true');
      return matchesSearch && matchesProp && matchesType && matchesActive;
    });
  }, [dormitories, searchTerm, properties, propertyFilter, typeFilter, isActiveFilter]);

  const createSchema = z.object({
    propertyId: z.string().min(1, 'Property is required'),
    name: z.string().min(1, 'Name is required'),
    type: z.enum(["Men's", "Women's", 'Mixed']),
    capacity: z.string().min(1).refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Capacity must be positive'),
    basePrice: z.string().min(1).refine(v => !isNaN(Number(v)) && Number(v) >= 0, 'Base price must be a number'),
    amenities: z.string().optional(),
    isActive: z.boolean(),
  });
  type CreateValues = z.infer<typeof createSchema>;
  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      propertyId: '',
      name: '',
      type: 'Mixed',
      capacity: '10',
      basePrice: '0',
      amenities: 'WiFi,Shared Bathroom',
      isActive: true,
    },
  });

  const editSchema = z.object({
    propertyId: z.string().min(1, 'Property is required'),
    name: z.string().min(1, 'Name is required'),
    type: z.enum(["Men's", "Women's", 'Mixed']),
    capacity: z.string().min(1).refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Capacity must be positive'),
    basePrice: z.string().min(1).refine(v => !isNaN(Number(v)) && Number(v) >= 0, 'Base price must be a number'),
    amenities: z.string().optional(),
    isActive: z.boolean(),
  });
  type EditValues = z.infer<typeof editSchema>;
  const editForm = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      propertyId: '',
      name: '',
      type: 'Mixed',
      capacity: '10',
      basePrice: '0',
      amenities: '',
      isActive: true,
    },
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dormitories</h1>
          <p className="text-muted-foreground mt-1">Manage dormitory rooms, bed assignments, and settings</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Dormitory
        </Button>
      </div>

      {/* Create Dormitory Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Dormitory</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={createForm.handleSubmit(async (values) => {
              try {
                const payload = {
                  propertyId: values.propertyId,
                  name: values.name,
                  type: values.type,
                  capacity: Number(values.capacity),
                  basePrice: Number(values.basePrice),
                  amenities: (values.amenities || '').split(',').map(a => a.trim()).filter(Boolean),
                  isActive: values.isActive,
                };
                const res = await dormitoryService.create(payload);
                const created = res.data.data as Dormitory;
                setDormitories((prev) => [created, ...prev]);
                success('Dormitory created');
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
                <Label>Property</Label>
                <Select value={createForm.watch('propertyId')} onValueChange={(v) => createForm.setValue('propertyId', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {createForm.formState.errors.propertyId && (
                  <p className="text-sm text-red-600">{createForm.formState.errors.propertyId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input {...createForm.register('name')} />
                {createForm.formState.errors.name && (
                  <p className="text-sm text-red-600">{createForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={createForm.watch('type')} onValueChange={(v) => createForm.setValue('type', v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Men's">Men's</SelectItem>
                    <SelectItem value="Women's">Women's</SelectItem>
                    <SelectItem value="Mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input type="number" {...createForm.register('capacity')} />
                {createForm.formState.errors.capacity && (
                  <p className="text-sm text-red-600">{createForm.formState.errors.capacity.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Base Price</Label>
                <Input type="number" step="0.01" {...createForm.register('basePrice')} />
                {createForm.formState.errors.basePrice && (
                  <p className="text-sm text-red-600">{createForm.formState.errors.basePrice.message}</p>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Amenities (comma separated)</Label>
                <Input {...createForm.register('amenities')} />
              </div>
              <div className="flex items-center space-x-2 md:col-span-2">
                <Checkbox id="isActive" checked={createForm.watch('isActive')} onCheckedChange={(v) => createForm.setValue('isActive', Boolean(v))} />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary">Create Dormitory</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Dormitories</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{totalAll}</div>
            <p className="text-xs text-muted-foreground">All dormitories</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">With Available Beds</CardTitle>
            <Home className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{availableAll}</div>
            <p className="text-xs text-muted-foreground">Dorms with availability</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Occupied Focus</CardTitle>
            <Home className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{occupiedAll}</div>
            <p className="text-xs text-muted-foreground">Dorms with high occupancy</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Occupancy Rate</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{totalAll > 0 ? Math.round((occupiedAll / totalAll) * 100) : 0}%</div>
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
                  placeholder="Search dormitories by any field (name, type, capacity, amenities, property)"
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
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Men's">Men's</SelectItem>
                <SelectItem value="Women's">Women's</SelectItem>
                <SelectItem value="Mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={isActiveFilter} onValueChange={setIsActiveFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Active" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Dormitories</CardTitle>
          <CardDescription>Manage and view all dormitories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Amenities</TableHead>
                  <TableHead>Base Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading dormitories...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No dormitories found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((d) => (
                    <TableRow key={d.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="font-medium">{d.name}</div>
                      </TableCell>
                      <TableCell>{d.type}</TableCell>
                      <TableCell>{d.capacity}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {d.amenities.slice(0, 3).map((a, idx) => (
                            <Badge key={idx} variant="outline">{a}</Badge>
                          ))}
                          {d.amenities.length > 3 && (
                            <div className="text-xs text-muted-foreground">+{d.amenities.length - 3} more</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">${'{'}d.basePrice{'}'}</TableCell>
                      <TableCell>
                        <Badge variant={d.isActive ? 'default' : 'secondary'}>
                          {d.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{properties.find(p => p.id === d.propertyId)?.name || d.propertyId}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => { setViewing(d); setViewOpen(true); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => {
                            setEditing(d);
                            editForm.reset({ name: d.name, type: d.type, capacity: String(d.capacity), basePrice: String(d.basePrice), amenities: d.amenities.join(', ') });
                            setEditOpen(true);
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => { setDeleting(d); setDeleteOpen(true); }}>
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

      {/* View Dormitory */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dormitory Details</DialogTitle>
          </DialogHeader>
          {viewing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{viewing.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{viewing.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Capacity</p>
                  <p className="font-medium">{viewing.capacity}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Base Price</p>
                  <p className="font-medium">${'{'}viewing.basePrice{'}'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Property</p>
                  <p className="font-medium">{properties.find(p => p.id === viewing.propertyId)?.name || viewing.propertyId}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Amenities</p>
                {viewing.amenities.length ? (
                  <div className="flex flex-wrap gap-2">
                    {viewing.amenities.map((a, idx) => (
                      <Badge key={idx} variant="outline">{a}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No amenities</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(viewing.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Updated</p>
                  <p className="font-medium">{new Date(viewing.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dormitory */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Dormitory</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={editForm.handleSubmit(async (values) => {
              if (!editing) return;
              try {
                const payload = {
                  propertyId: values.propertyId,
                  name: values.name,
                  type: values.type,
                  capacity: Number(values.capacity),
                  basePrice: Number(values.basePrice),
                  amenities: (values.amenities || '').split(',').map(a => a.trim()).filter(Boolean),
                  isActive: values.isActive,
                };
                const res = await dormitoryService.update(editing.id, payload);
                const updated = res.data.data as Dormitory;
                setDormitories((prev) => prev.map(d => d.id === editing.id ? updated : d));
                success('Dormitory updated');
                setEditOpen(false);
                setEditing(null);
              } catch (e) {
                const apiErr = handleApiError(e as AxiosError);
                error(apiErr.message);
              }
            })}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input {...editForm.register('name')} />
                {editForm.formState.errors.name && (
                  <p className="text-sm text-red-600">{editForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Property</Label>
                <Select value={editForm.watch('propertyId')} onValueChange={(v) => editForm.setValue('propertyId', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editForm.formState.errors.propertyId && (
                  <p className="text-sm text-red-600">{editForm.formState.errors.propertyId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={editForm.watch('type')} onValueChange={(v) => editForm.setValue('type', v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Men's">Men's</SelectItem>
                    <SelectItem value="Women's">Women's</SelectItem>
                    <SelectItem value="Mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input type="number" {...editForm.register('capacity')} />
                {editForm.formState.errors.capacity && (
                  <p className="text-sm text-red-600">{editForm.formState.errors.capacity.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Base Price</Label>
                <Input type="number" step="0.01" {...editForm.register('basePrice')} />
                {editForm.formState.errors.basePrice && (
                  <p className="text-sm text-red-600">{editForm.formState.errors.basePrice.message}</p>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Amenities (comma separated)</Label>
                <Input {...editForm.register('amenities')} />
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

      {/* Delete Dormitory */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Dormitory</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this dormitory? This action cannot be undone.</p>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              type="button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!deleting) return;
                try {
                  await dormitoryService.delete(deleting.id);
                  setDormitories((prev) => prev.filter(x => x.id !== deleting.id));
                  success('Dormitory deleted');
                  setDeleteOpen(false);
                  setDeleting(null);
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
