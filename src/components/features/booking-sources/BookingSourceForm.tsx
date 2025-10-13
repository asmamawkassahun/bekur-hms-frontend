import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchBookingTypes } from '@/store/slices/bookingTypeSlice';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import type {
  BookingSource,
  CreateBookingSourceData,
  UpdateBookingSourceData,
} from '@/services/booking.service';

const bookingSourceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  bookingTypeId: z.string().min(1, 'Booking type is required'),
  commissionRate: z
    .number()
    .min(0, 'Commission rate must be at least 0')
    .max(100, 'Commission rate cannot exceed 100'),
  isActive: z.boolean(),
});

type BookingSourceFormData = z.infer<typeof bookingSourceSchema>;

interface BookingSourceFormProps {
  mode: 'create' | 'edit';
  bookingSource?: BookingSource;
  onSubmit: (data: CreateBookingSourceData | UpdateBookingSourceData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function BookingSourceForm({
  mode,
  bookingSource,
  onSubmit,
  onCancel,
  loading = false,
}: BookingSourceFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { bookingTypes } = useSelector((state: RootState) => state.bookingType);

  // Fetch booking types when component mounts
  useEffect(() => {
    dispatch(fetchBookingTypes({ page: 1, limit: 100, isActive: true }));
  }, [dispatch]);

  const form = useForm<BookingSourceFormData>({
    resolver: zodResolver(bookingSourceSchema),
    defaultValues: {
      name: bookingSource?.name || '',
      bookingTypeId: bookingSource?.bookingTypeId || '',
      commissionRate: bookingSource?.commissionRate || 0,
      isActive:
        bookingSource?.isActive !== undefined ? bookingSource.isActive : true,
    },
  });

  const handleSubmit = (data: BookingSourceFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name*</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Booking.com, Direct Walk-in"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bookingTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Booking Type*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select booking type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {bookingTypes
                    .filter((bt) => bt.isActive)
                    .map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the booking type this source belongs to
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="commissionRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Commission Rate (%)*</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Percentage commission charged for this booking source (0-100%)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Active</FormLabel>
                <FormDescription>
                  Set whether this booking source is active and available for
                  use
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
