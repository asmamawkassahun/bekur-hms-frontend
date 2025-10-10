import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import { fetchDormitories } from '@/store/slices/dormitorySlice';
import { fetchBedTypes } from '@/store/slices/bedTypeSlice';
import type { Bed, Dormitory, BedType } from '@/types';

const BED_STATUSES = [
  'AVAILABLE',
  'OCCUPIED',
  'MAINTENANCE',
  'OUT_OF_ORDER',
] as const;

const bedSchema = z.object({
  number: z.string().min(1, 'Bed number is required'),
  dormitoryId: z.string().uuid({ message: 'Dormitory is required' }),
  typeId: z.string().uuid({ message: 'Bed type is required' }),
  price: z.coerce.number().min(0, 'Price must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'OUT_OF_ORDER']),
  amenities: z.array(z.string()).optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type BedFormData = z.infer<typeof bedSchema>;

interface BedFormProps {
  bed?: Bed;
  onSubmit: (data: BedFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function BedForm({
  bed,
  onSubmit,
  onCancel,
  loading = false,
}: BedFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { dormitories } = useSelector((state: RootState) => state.dormitory);
  const { bedTypes } = useSelector((state: RootState) => state.bedType);

  const form = useForm<BedFormData>({
    resolver: zodResolver(bedSchema),
    defaultValues: bed
      ? {
          number: bed.number,
          dormitoryId: bed.dormitoryId,
          typeId: (bed as any).bedTypeId || (bed as any).typeId || '',
          price: (bed as any).basePrice ?? (bed as any).price ?? 0,
          currency: (bed as any).currency || 'USD',
          status: bed.status,
          amenities: bed.amenities || [],
          description: bed.description,
          isActive: bed.isActive,
        }
      : {
          number: '',
          dormitoryId: '',
          typeId: '',
          price: 0,
          currency: 'USD',
          status: 'AVAILABLE',
          amenities: [],
          description: '',
          isActive: true,
        },
  });

  // Load dropdown data
  useEffect(() => {
    dispatch(fetchDormitories({ page: 1, limit: 100 }));
    dispatch(fetchBedTypes({ page: 1, limit: 100 }));
  }, [dispatch]);

  const handleSubmit = (values: BedFormData) => {
    const payload = {
      number: values.number,
      dormitoryId: values.dormitoryId,
      bedTypeId: values.typeId,
      basePrice: values.price,
      status: values.status,
      isActive: values.isActive,
      description: values.description,
      amenities: values.amenities?.join(', '),
    };
    onSubmit(payload as unknown as BedFormData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bed Number</FormLabel>
                <FormControl>
                  <Input placeholder="A1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dormitoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dormitory</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select dormitory" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(dormitories || []).map((d: Dormitory) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
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
            name="typeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bed Type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bed type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(bedTypes || []).map((bt: BedType) => (
                      <SelectItem key={bt.id} value={bt.id}>
                        {bt.name}
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {BED_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status?.replace('_', ' ') || 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="ETB">ETB - Ethiopian Birr</SelectItem>
                    <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                    <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                    <SelectItem value="ZAR">
                      ZAR - South African Rand
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Amenities */}
        <FormField
          control={form.control}
          name="amenities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amenities</FormLabel>
              <FormControl>
                <Input
                  placeholder="Pillow, Blanket, Locker, Power Outlet"
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

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Bed description..."
                  {...field}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Active Bed</FormLabel>
              </div>
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
            {bed ? 'Save Changes' : 'Create'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
