import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import type {
  BookingType,
  CreateBookingTypeData,
  UpdateBookingTypeData,
} from '@/services/booking.service';

const bookingTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type BookingTypeFormData = z.infer<typeof bookingTypeSchema>;

interface BookingTypeFormProps {
  mode: 'create' | 'edit';
  bookingType?: BookingType;
  onSubmit: (data: CreateBookingTypeData | UpdateBookingTypeData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function BookingTypeForm({
  mode,
  bookingType,
  onSubmit,
  onCancel,
  loading = false,
}: BookingTypeFormProps) {
  const form = useForm<BookingTypeFormData>({
    resolver: zodResolver(bookingTypeSchema),
    defaultValues: {
      name: bookingType?.name || '',
      description: bookingType?.description || '',
      isActive:
        bookingType?.isActive !== undefined ? bookingType.isActive : true,
    },
  });

  const handleSubmit = (data: BookingTypeFormData) => {
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
                <Input placeholder="e.g., Walk-in, Online Booking" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description of this booking type"
                  rows={3}
                  {...field}
                />
              </FormControl>
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
                <p className="text-sm text-muted-foreground">
                  Set whether this booking type is active and available for use
                </p>
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
