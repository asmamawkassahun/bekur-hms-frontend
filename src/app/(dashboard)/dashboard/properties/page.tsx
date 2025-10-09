'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  fetchProperties,
  fetchPropertyStats,
  createProperty,
} from '@/store/slices/propertySlice';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNotification } from '@/hooks/useNotification';
import { handleApiError } from '@/lib/api/error-handler';
import type { AxiosError } from 'axios';
import { propertyService } from '@/services/property.service';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Building,
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export default function PropertiesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { properties, propertyStats, loading, pagination } = useSelector(
    (state: RootState) => state.property,
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<null | (typeof properties)[number]>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { success, error } = useNotification();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<null | (typeof properties)[number]>(null);
  const [deleting, setDeleting] = useState<null | (typeof properties)[number]>(null);
  const [activeTotal, setActiveTotal] = useState(0);

  const createSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    country: z.string().min(1, 'Country is required'),
    timezone: z.string().min(1, 'Timezone is required'),
    currency: z.string().min(1, 'Currency is required'),
    taxRate: z
      .string()
      .min(1, 'Tax rate is required')
      .refine((v) => !isNaN(Number(v)), 'Tax rate must be a number'),
    isActive: z.boolean(),
  });

  type CreateFormValues = z.infer<typeof createSchema>;
  const editSchema = createSchema;
  const editForm = useForm<CreateFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      country: '',
      timezone: 'Africa/Addis_Ababa',
      currency: 'ETB',
      taxRate: '15',
      isActive: true,
    },
  });

  const form = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      country: '',
      timezone: 'Africa/Addis_Ababa',
      currency: 'ETB',
      taxRate: '15',
      isActive: true,
    },
  });

  useEffect(() => {
    dispatch(
      fetchProperties({
        page,
        limit,
        search: searchTerm || undefined,
      }),
    );
  }, [dispatch, searchTerm, page, limit]);

  // Load real active properties count from backend meta
  useEffect(() => {
    const loadActiveCount = async () => {
      try {
        const res = await propertyService.getAll({ page: 1, limit: 1, isActive: true });
        setActiveTotal(res.data.meta?.total || 0);
      } catch (e) {
        // Non-fatal; keep 0
      }
    };
    loadActiveCount();
  }, []);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredProperties = properties.filter((p) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    const searchable = [
      p.name,
      p.address,
      p.city,
      p.country,
      p.timezone,
      p.currency,
      String(p.taxRate),
      p.email || '',
      p.phone || '',
      p.isActive ? 'active' : 'inactive',
    ]
      .join(' ')
      .toLowerCase();
    return searchable.includes(term);
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Properties</h1>
          <p className="text-muted-foreground mt-1">
            Manage hotel properties and locations
          </p>
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Property
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Property</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              try {
                const payload = {
                  name: values.name,
                  address: values.address,
                  city: values.city,
                  country: values.country,
                  timezone: values.timezone,
                  currency: values.currency,
                  taxRate: Number(values.taxRate),
                  isActive: values.isActive,
                };
                await dispatch(createProperty(payload)).unwrap();
                success('Property created');
                setOpen(false);
                form.reset();
                dispatch(
                  fetchProperties({ page: 1, limit, search: searchTerm || undefined }),
                );
                setPage(1);
              } catch (e: unknown) {
                const apiErr = handleApiError(e as AxiosError);
                error(apiErr.message);
              }
            })}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...form.register('name')} />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...form.register('address')} />
                {form.formState.errors.address && (
                  <p className="text-sm text-red-600">{form.formState.errors.address.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...form.register('city')} />
                {form.formState.errors.city && (
                  <p className="text-sm text-red-600">{form.formState.errors.city.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" {...form.register('country')} />
                {form.formState.errors.country && (
                  <p className="text-sm text-red-600">{form.formState.errors.country.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input id="timezone" placeholder="Africa/Addis_Ababa" {...form.register('timezone')} />
                {form.formState.errors.timezone && (
                  <p className="text-sm text-red-600">{form.formState.errors.timezone.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" placeholder="ETB" {...form.register('currency')} />
                {form.formState.errors.currency && (
                  <p className="text-sm text-red-600">{form.formState.errors.currency.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input id="taxRate" type="number" step="0.01" {...form.register('taxRate')} />
                {form.formState.errors.taxRate && (
                  <p className="text-sm text-red-600">{form.formState.errors.taxRate.message}</p>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-6">
                <Checkbox id="isActive" checked={form.watch('isActive')} onCheckedChange={(v) => form.setValue('isActive', Boolean(v))} />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary" disabled={loading}>
                Create Property
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Properties
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {pagination.total}
            </div>
            <p className="text-xs text-muted-foreground">All properties</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Properties
            </CardTitle>
            <Building className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {activeTotal}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently operational
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {propertyStats
                ? formatCurrency(propertyStats.totalRevenue, 'USD')
                : '$0'}
            </div>
            <p className="text-xs text-muted-foreground">
              All properties combined
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Occupancy Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {propertyStats ? `${propertyStats.occupancyRate}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              Average across properties
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Search Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by property name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Edit Property */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!editing) return;
              try {
                const values = editForm.getValues();
                const payload = {
                  name: values.name,
                  address: values.address,
                  city: values.city,
                  country: values.country,
                  timezone: values.timezone,
                  currency: values.currency,
                  taxRate: Number(values.taxRate),
                  isActive: values.isActive,
                };
                // lazy import to avoid circular
                const { updateProperty } = await import('@/store/slices/propertySlice');
                await dispatch(updateProperty({ id: editing.id, data: payload })).unwrap();
                success('Property updated');
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
                <Label>Name</Label>
                <Input {...editForm.register('name')} />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input {...editForm.register('address')} />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input {...editForm.register('city')} />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input {...editForm.register('country')} />
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Input {...editForm.register('timezone')} />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input {...editForm.register('currency')} />
              </div>
              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input type="number" step="0.01" {...editForm.register('taxRate')} />
              </div>
              <div className="flex items-center space-x-2 mt-6">
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

      {/* Delete Property */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Property</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this property? This action cannot be undone.</p>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              type="button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!deleting) return;
                try {
                  const { deleteProperty } = await import('@/store/slices/propertySlice');
                  await dispatch(deleteProperty(deleting.id)).unwrap();
                  success('Property deleted');
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
      {/* Properties Table */}
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Properties</CardTitle>
          <CardDescription>
            Manage and view all hotel properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Tax Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading properties...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredProperties.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No properties found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProperties.map((property) => (
                    <TableRow key={property.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="font-medium">{property.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {property.address}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {property.city}, {property.country}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            UTC
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {property.email || 'No email'}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {property.phone || 'No phone'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{property.currency}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {property.taxRate}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={property.isActive ? 'default' : 'secondary'}
                        >
                          {property.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(property.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setViewing(property); setViewOpen(true); }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => {
                            setEditing(property);
                            editForm.reset({
                              name: property.name,
                              address: property.address,
                              city: property.city,
                              country: property.country,
                              timezone: property.timezone,
                              currency: property.currency,
                              taxRate: String(property.taxRate),
                              isActive: property.isActive,
                            });
                            setEditOpen(true);
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => { setDeleting(property); setDeleteOpen(true); }}>
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
              <select
                className="h-9 rounded-md border bg-background px-3 text-sm"
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
              <Button variant="outline" disabled={pagination.totalPages && page >= pagination.totalPages ? true : false} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Property */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Property Details</DialogTitle>
          </DialogHeader>
          {viewing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{viewing.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Currency</p>
                  <p className="font-medium">{viewing.currency}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{viewing.address}, {viewing.city}, {viewing.country}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Timezone</p>
                  <p className="font-medium">{viewing.timezone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tax Rate</p>
                  <p className="font-medium">{viewing.taxRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">{viewing.isActive ? 'Active' : 'Inactive'}</p>
                </div>
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
    </div>
  );
}
