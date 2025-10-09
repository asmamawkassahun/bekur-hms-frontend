'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchReservations, createReservation, getAvailability } from '@/store/slices/reservationSlice';
import { fetchGuests } from '@/store/slices/guestSlice';
import { fetchProperties } from '@/store/slices/propertySlice';
import { ReservationStatus } from '@/types';
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
  Calendar,
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Edit,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNotification } from '@/hooks/useNotification';
import type { AxiosError } from 'axios';
import { handleApiError } from '@/lib/api/error-handler';
import type { Guest, Property } from '@/types';

export default function ReservationsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { reservations, loading, pagination } = useSelector(
    (state: RootState) => state.reservation,
  );
  const { guests } = useSelector((state: RootState) => state.guest);
  const { properties } = useSelector((state: RootState) => state.property);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openCreate, setOpenCreate] = useState(false);
  const { success, error } = useNotification();

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [checkInDate, setCheckInDate] = useState<string>('');
  const [checkOutDate, setCheckOutDate] = useState<string>('');
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [availableBeds, setAvailableBeds] = useState<any[]>([]);

  useEffect(() => {
    dispatch(
      fetchReservations({
        page: 1,
        limit: 10,
        filters: {
          status:
            statusFilter === 'all'
              ? undefined
              : (statusFilter as ReservationStatus),
          guestName: searchTerm || undefined,
        },
      }),
    );
  }, [dispatch, searchTerm, statusFilter]);

  // Preload dropdown data when opening modal
  useEffect(() => {
    if (openCreate) {
      (dispatch as AppDispatch)(fetchProperties({ page: 1, limit: 100 })).catch(() => {});
      (dispatch as AppDispatch)(fetchGuests({ page: 1, limit: 100 })).catch(() => {});
    }
  }, [openCreate, dispatch]);

  // Load availability when property and dates are set
  useEffect(() => {
    const canLoad = selectedPropertyId && checkInDate && checkOutDate;
    if (!canLoad) return;
    (async () => {
      try {
        const payload = await (dispatch as AppDispatch)(getAvailability({
          propertyId: selectedPropertyId,
          checkIn: checkInDate,
          checkOut: checkOutDate,
        })).unwrap();
        const data = payload?.data as any;
        setAvailableRooms((data?.rooms as any[]) || []);
        setAvailableBeds((data?.beds as any[]) || []);
      } catch (_e) {
        setAvailableRooms([]);
        setAvailableBeds([]);
      }
    })();
  }, [selectedPropertyId, checkInDate, checkOutDate, dispatch]);

  const createSchema = z.object({
    propertyId: z.string().uuid({ message: 'Property is required' }),
    guestId: z.string().uuid({ message: 'Guest is required' }),
    roomId: z.string().uuid().optional().or(z.literal('')),
    bedId: z.string().uuid().optional().or(z.literal('')),
    checkIn: z.string().min(1, 'Check-in is required'),
    checkOut: z.string().min(1, 'Check-out is required'),
    adults: z.coerce.number().int().min(1).default(1),
    children: z.coerce.number().int().min(0).default(0),
    specialRequests: z.array(z.string()).optional(),
    notes: z.string().optional(),
    groupId: z.string().optional(),
  }).refine((vals) => Boolean(vals.roomId) || Boolean(vals.bedId), {
    message: 'Select a room or a bed',
    path: ['roomId'],
  });

  type CreateReservationForm = z.infer<typeof createSchema>;
  const form = useForm<CreateReservationForm>({
    resolver: zodResolver(createSchema) as any,
    defaultValues: {
      propertyId: '',
      guestId: '',
      roomId: '',
      bedId: '',
      checkIn: '',
      checkOut: '',
      adults: 1,
      children: 0,
      specialRequests: [],
      notes: '',
      groupId: '',
    } as CreateReservationForm,
  });

  const onSubmit = async (values: CreateReservationForm) => {
    // Normalize empty strings to undefined for optional fields
    const payload = {
      ...values,
      roomId: values.roomId || undefined,
      bedId: values.bedId || undefined,
      groupId: values.groupId || undefined,
    };
    try {
      await (dispatch as AppDispatch)(createReservation(payload)).unwrap();
      success('Reservation created');
      setOpenCreate(false);
      form.reset();
      setAvailableRooms([]);
      setAvailableBeds([]);
      setSelectedPropertyId('');
      setCheckInDate('');
      setCheckOutDate('');
      // Refetch list first page
      dispatch(fetchReservations({ page: 1, limit: 10 }));
    } catch (e) {
      const apiErr = handleApiError(e as AxiosError);
      error(apiErr.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      CONFIRMED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      CHECKED_IN: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      CHECKED_OUT: { color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
      CANCELLED: { color: 'bg-red-100 text-red-800', icon: XCircle },
      NO_SHOW: { color: 'bg-red-100 text-red-800', icon: XCircle },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reservations</h1>
          <p className="text-muted-foreground mt-1">
            Manage hotel reservations and bookings
          </p>
        </div>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              New Reservation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Reservation</DialogTitle>
            </DialogHeader>
            <Form {...(form as any)}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Property */}
                <FormField control={form.control as any} name="propertyId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property</FormLabel>
                    <Select value={field.value} onValueChange={(val) => { field.onChange(val); setSelectedPropertyId(val); }}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(properties || []).map((p: Property) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Guest */}
                <FormField control={form.control as any} name="guestId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guest</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select guest" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(guests || []).map((g: Guest) => (
                          <SelectItem key={g.id} value={g.id}>{g.firstName} {g.lastName} — {g.email}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Check-in/Check-out */}
                <FormField control={form.control as any} name="checkIn" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-in</FormLabel>
                    <FormControl>
                      <Input type="date" value={field.value} onChange={(e) => { field.onChange(e.target.value); setCheckInDate(e.target.value); }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control as any} name="checkOut" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-out</FormLabel>
                    <FormControl>
                      <Input type="date" value={field.value} onChange={(e) => { field.onChange(e.target.value); setCheckOutDate(e.target.value); }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Room or Bed */}
                <FormField control={form.control as any} name="roomId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room (optional)</FormLabel>
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={selectedPropertyId && checkInDate && checkOutDate ? 'Select room' : 'Select property & dates first'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableRooms.map((r: any) => (
                          <SelectItem key={r.id} value={r.id}>{r.number || r.id}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control as any} name="bedId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bed (optional)</FormLabel>
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={selectedPropertyId && checkInDate && checkOutDate ? 'Select bed' : 'Select property & dates first'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableBeds.map((b: any) => (
                          <SelectItem key={b.id} value={b.id}>{b.number || b.id}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Guests count */}
                <FormField control={form.control as any} name="adults" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adults</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        value={Number(field.value ?? 1)}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control as any} name="children" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Children</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        value={Number(field.value ?? 0)}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Special Requests (comma separated) */}
                <FormField control={form.control as any} name="specialRequests" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Special Requests</FormLabel>
                    <FormControl>
                      <Input placeholder="Late check-in, Extra pillows" value={(field.value || []).join(', ')} onChange={(e) => field.onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Notes */}
                <FormField control={form.control as any} name="notes" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional notes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Group ID */}
                <FormField control={form.control as any} name="groupId" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Group ID (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Group/agency identifier" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="md:col-span-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>Cancel</Button>
                  <Button type="submit" className="bg-primary" disabled={loading}>Create</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Reservations
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {pagination.total}
            </div>
            <p className="text-xs text-muted-foreground">
              All time reservations
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Checked In
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {reservations.filter((r) => r.status === 'CHECKED_IN').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently in hotel</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {reservations.filter((r) => r.status === 'PENDING').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting confirmation
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {formatCurrency(
                reservations.reduce((sum, r) => sum + r.totalPrice, 0),
                'USD',
              )}
            </div>
            <p className="text-xs text-muted-foreground">Total revenue</p>
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
                  placeholder="Search by guest name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="CHECKED_IN">Checked In</SelectItem>
                <SelectItem value="CHECKED_OUT">Checked Out</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="NO_SHOW">No Show</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reservations Table */}
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Reservations</CardTitle>
          <CardDescription>
            Manage and view all hotel reservations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading reservations...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : reservations.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No reservations found
                    </TableCell>
                  </TableRow>
                ) : (
                  reservations.map((reservation) => (
                    <TableRow
                      key={reservation.id}
                      className="hover:bg-muted/50"
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {reservation.guest?.firstName}{' '}
                            {reservation.guest?.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {reservation.guest?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {reservation.room?.number ||
                              reservation.bed?.number}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {reservation.room?.type || 'Bed'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(reservation.checkIn)}</TableCell>
                      <TableCell>{formatDate(reservation.checkOut)}</TableCell>
                      <TableCell>
                        {getStatusBadge(reservation.status)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(
                          reservation.totalPrice,
                          reservation.currency,
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
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
        </CardContent>
      </Card>
    </div>
  );
}
