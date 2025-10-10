import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchProperties } from '@/store/slices/propertySlice';
import { fetchGuests } from '@/store/slices/guestSlice';
import { getAvailability } from '@/store/slices/reservationSlice';
import type { Guest, Property, Reservation } from '@/types';

const reservationSchema = z
  .object({
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
  })
  .refine((vals) => Boolean(vals.roomId) || Boolean(vals.bedId), {
    message: 'Select a room or a bed',
    path: ['roomId'],
  });

type ReservationFormData = z.infer<typeof reservationSchema>;

interface ReservationFormProps {
  reservation?: Reservation;
  onSubmit: (data: ReservationFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ReservationForm({
  reservation,
  onSubmit,
  onCancel,
  loading = false,
}: ReservationFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { properties } = useSelector((state: RootState) => state.property);
  const { guests } = useSelector((state: RootState) => state.guest);

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [checkInDate, setCheckInDate] = useState<string>('');
  const [checkOutDate, setCheckOutDate] = useState<string>('');
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [availableBeds, setAvailableBeds] = useState<any[]>([]);

  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: reservation
      ? {
          propertyId: reservation.propertyId,
          guestId: reservation.guestId,
          roomId: reservation.roomId || '',
          bedId: reservation.bedId || '',
          checkIn: reservation.checkIn,
          checkOut: reservation.checkOut,
          adults: reservation.adults,
          children: reservation.children,
          specialRequests: reservation.specialRequests || [],
          notes: reservation.notes,
          groupId: reservation.groupId || '',
        }
      : {
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
        },
  });

  // Load dropdown data
  useEffect(() => {
    dispatch(fetchProperties({ page: 1, limit: 100 }));
    dispatch(fetchGuests({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Load availability when property and dates are set
  useEffect(() => {
    const canLoad = selectedPropertyId && checkInDate && checkOutDate;
    if (!canLoad) return;

    (async () => {
      try {
        const payload = await dispatch(
          getAvailability({
            propertyId: selectedPropertyId,
            checkIn: checkInDate,
            checkOut: checkOutDate,
          }),
        ).unwrap();
        const data = payload?.data as any;
        setAvailableRooms((data?.rooms as any[]) || []);
        setAvailableBeds((data?.beds as any[]) || []);
      } catch (_e) {
        setAvailableRooms([]);
        setAvailableBeds([]);
      }
    })();
  }, [selectedPropertyId, checkInDate, checkOutDate, dispatch]);

  const handleSubmit = (values: ReservationFormData) => {
    const payload = {
      ...values,
      roomId: values.roomId || undefined,
      bedId: values.bedId || undefined,
      groupId: values.groupId || undefined,
    };
    onSubmit(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Two-column grid for short fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Property */}
          <FormField
            control={form.control}
            name="propertyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    setSelectedPropertyId(val);
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(properties || []).map((p: Property) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Guest */}
          <FormField
            control={form.control}
            name="guestId"
            render={({ field }) => (
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
                      <SelectItem key={g.id} value={g.id}>
                        {g.firstName} {g.lastName} — {g.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Check-in/Check-out */}
          <FormField
            control={form.control}
            name="checkIn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Check-in</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      setCheckInDate(e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="checkOut"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Check-out</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      setCheckOutDate(e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Room or Bed */}
          <FormField
            control={form.control}
            name="roomId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room (optional)</FormLabel>
                <Select
                  value={field.value || ''}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          selectedPropertyId && checkInDate && checkOutDate
                            ? 'Select room'
                            : 'Select property & dates first'
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableRooms.map((r: any) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.number || r.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bedId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bed (optional)</FormLabel>
                <Select
                  value={field.value || ''}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          selectedPropertyId && checkInDate && checkOutDate
                            ? 'Select bed'
                            : 'Select property & dates first'
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableBeds.map((b: any) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.number || b.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Guests count */}
          <FormField
            control={form.control}
            name="adults"
            render={({ field }) => (
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
            )}
          />
          <FormField
            control={form.control}
            name="children"
            render={({ field }) => (
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
            )}
          />

          {/* Special Requests */}
          <FormField
            control={form.control}
            name="specialRequests"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Special Requests</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Late check-in, Extra pillows"
                    value={(field.value || []).join(', ')}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Group ID */}
          <FormField
            control={form.control}
            name="groupId"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Group ID (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Group/agency identifier" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Optional notes" {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary cursor-pointer"
            disabled={loading}
          >
            {reservation ? 'Save Changes' : 'Create'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
