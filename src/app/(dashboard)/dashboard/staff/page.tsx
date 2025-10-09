'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchStaff, createStaff, updateStaff, assignStaffRoles } from '@/store/slices/staffSlice';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, UserCog, Search, Eye, Edit, MoreHorizontal } from 'lucide-react';

const ALL_ROLES = ['SUPER_ADMIN', 'PROPERTY_MANAGER', 'FRONT_DESK', 'HOUSEKEEPING', 'FINANCE_STAFF'] as const;

export default function StaffPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { staff, loading, pagination } = useSelector((s: RootState) => s.staff);
  const { success, error } = useNotification();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | (typeof ALL_ROLES)[number]>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'true' | 'false'>('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [createOpen, setCreateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [rolesOpen, setRolesOpen] = useState(false);
  const [viewing, setViewing] = useState<any | null>(null);
  const [editing, setEditing] = useState<any | null>(null);

  useEffect(() => {
    dispatch(fetchStaff({ page, limit, search: searchTerm || undefined }));
  }, [dispatch, page, limit, searchTerm]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return staff.filter((s) => {
      const searchable = [
        s.firstName,
        s.lastName,
        s.email,
        s.phone || '',
        s.roles.join(' '),
        s.isActive ? 'active' : 'inactive',
      ]
        .join(' ')
        .toLowerCase();
      const matchesTerm = term === '' || searchable.includes(term);
      const matchesRole = roleFilter === 'all' || s.roles.includes(roleFilter);
      const matchesActive = activeFilter === 'all' || s.isActive === (activeFilter === 'true');
      return matchesTerm && matchesRole && matchesActive;
    });
  }, [staff, searchTerm, roleFilter, activeFilter]);

  const [createForm, setCreateForm] = useState({ firstName: '', lastName: '', email: '', phone: '', roles: [] as string[], isActive: true, temporaryPassword: '' });
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', phone: '', isActive: true });
  const [rolesForm, setRolesForm] = useState<string[]>([]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff</h1>
          <p className="text-muted-foreground mt-1">Manage hotel staff and user accounts</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
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
                  placeholder="Search by name, email, phone, role"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as any)}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {ALL_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{r.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={activeFilter} onValueChange={(v) => setActiveFilter(v as any)}>
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
          <CardTitle>Staff</CardTitle>
          <CardDescription>Manage and view staff accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading staff...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No staff found</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((s) => (
                    <TableRow key={s.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="font-medium">{s.firstName} {s.lastName}</div>
                        <div className="text-sm text-muted-foreground">{s.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {s.phone && <div className="text-sm">{s.phone}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {s.roles.map((r) => (
                            <Badge key={r} variant="outline">{r.replace('_', ' ')}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={s.isActive ? 'default' : 'secondary'}>{s.isActive ? 'Active' : 'Inactive'}</Badge>
                      </TableCell>
                      <TableCell>{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => { setViewing(s); setViewOpen(true); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => { setEditing(s); setEditForm({ firstName: s.firstName, lastName: s.lastName, phone: s.phone || '', isActive: s.isActive }); setEditOpen(true); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => { setEditing(s); setRolesForm(s.roles); setRolesOpen(true); }}>
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
                <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
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

      {/* Create Staff */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Staff</DialogTitle></DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await dispatch(createStaff({
                  firstName: createForm.firstName,
                  lastName: createForm.lastName,
                  email: createForm.email,
                  phone: createForm.phone || undefined,
                  roles: createForm.roles as any,
                  temporaryPassword: createForm.temporaryPassword || undefined,
                  isActive: createForm.isActive,
                })).unwrap();
                success('Staff account created');
                setCreateOpen(false);
                setCreateForm({ firstName: '', lastName: '', email: '', phone: '', roles: [], isActive: true, temporaryPassword: '' });
                setPage(1); dispatch(fetchStaff({ page: 1, limit }));
              } catch (e) {
                const apiErr = handleApiError(e as AxiosError); error(apiErr.message);
              }
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>First Name</Label><Input value={createForm.firstName} onChange={(e) => setCreateForm((s) => ({ ...s, firstName: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Last Name</Label><Input value={createForm.lastName} onChange={(e) => setCreateForm((s) => ({ ...s, lastName: e.target.value }))} /></div>
              <div className="space-y-2 md:col-span-2"><Label>Email</Label><Input type="email" value={createForm.email} onChange={(e) => setCreateForm((s) => ({ ...s, email: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={createForm.phone} onChange={(e) => setCreateForm((s) => ({ ...s, phone: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Temporary Password</Label><Input type="password" value={createForm.temporaryPassword} onChange={(e) => setCreateForm((s) => ({ ...s, temporaryPassword: e.target.value }))} /></div>
              <div className="space-y-2 md:col-span-2">
                <Label>Roles</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {ALL_ROLES.map((r) => (
                    <label key={r} className="flex items-center gap-2 text-sm"><Checkbox checked={createForm.roles.includes(r)} onCheckedChange={(v) => setCreateForm((s) => ({ ...s, roles: v ? Array.from(new Set([...s.roles, r])) : s.roles.filter((x) => x !== r) }))} />{r.replace('_', ' ')}</label>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2 md:col-span-2"><Checkbox checked={createForm.isActive} onCheckedChange={(v) => setCreateForm((s) => ({ ...s, isActive: Boolean(v) }))} /><Label>Active</Label></div>
            </div>
            <DialogFooter><Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button><Button type="submit" className="bg-primary">Create</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Staff */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Staff Details</DialogTitle></DialogHeader>
          {viewing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><p className="text-sm text-muted-foreground">Name</p><p className="font-medium">{viewing.firstName} {viewing.lastName}</p></div>
                <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{viewing.email}</p></div>
                <div><p className="text-sm text-muted-foreground">Phone</p><p className="font-medium">{viewing.phone || '—'}</p></div>
                <div><p className="text-sm text-muted-foreground">Status</p><p className="font-medium">{viewing.isActive ? 'Active' : 'Inactive'}</p></div>
                <div><p className="text-sm text-muted-foreground">Created</p><p className="font-medium">{new Date(viewing.createdAt).toLocaleString()}</p></div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Roles</p>
                <div className="flex flex-wrap gap-2">{viewing.roles.map((r: string) => (<Badge key={r} variant="outline">{r.replace('_', ' ')}</Badge>))}</div>
              </div>
            </div>
          ) : null}
          <DialogFooter><Button type="button" variant="ghost" onClick={() => setViewOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Staff */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Staff</DialogTitle></DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault(); if (!editing) return;
              try {
                await dispatch(updateStaff({ id: editing.id, data: { firstName: editForm.firstName, lastName: editForm.lastName, phone: editForm.phone || undefined, isActive: editForm.isActive } })).unwrap();
                success('Staff updated'); setEditOpen(false); setEditing(null);
              } catch (e) { const apiErr = handleApiError(e as AxiosError); error(apiErr.message); }
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>First Name</Label><Input value={editForm.firstName} onChange={(e) => setEditForm((s) => ({ ...s, firstName: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Last Name</Label><Input value={editForm.lastName} onChange={(e) => setEditForm((s) => ({ ...s, lastName: e.target.value }))} /></div>
              <div className="space-y-2 md:col-span-2"><Label>Phone</Label><Input value={editForm.phone} onChange={(e) => setEditForm((s) => ({ ...s, phone: e.target.value }))} /></div>
              <div className="flex items-center space-x-2 md:col-span-2"><Checkbox checked={editForm.isActive} onCheckedChange={(v) => setEditForm((s) => ({ ...s, isActive: Boolean(v) }))} /><Label>Active</Label></div>
            </div>
            <DialogFooter><Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button><Button type="submit" className="bg-primary">Save Changes</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Roles */}
      <Dialog open={rolesOpen} onOpenChange={setRolesOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Roles</DialogTitle></DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault(); if (!editing) return;
              try {
                await dispatch(assignStaffRoles({ id: editing.id, data: { roles: rolesForm as any } })).unwrap();
                success('Roles updated'); setRolesOpen(false); setEditing(null);
              } catch (e) { const apiErr = handleApiError(e as AxiosError); error(apiErr.message); }
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {ALL_ROLES.map((r) => (
                <label key={r} className="flex items-center gap-2 text-sm"><Checkbox checked={rolesForm.includes(r)} onCheckedChange={(v) => setRolesForm((prev) => v ? Array.from(new Set([...prev, r])) : prev.filter((x) => x !== r))} />{r.replace('_', ' ')}</label>
              ))}
            </div>
            <DialogFooter><Button type="button" variant="ghost" onClick={() => setRolesOpen(false)}>Cancel</Button><Button type="submit" className="bg-primary">Save Roles</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
