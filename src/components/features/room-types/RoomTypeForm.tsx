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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TagInput } from '@/components/ui/tag-input';
import { ImageUpload } from '@/components/ui/image-upload';
import { Button } from '@/components/ui/button';
import { BedConfigurationSection } from './BedConfigurationSection';
import type {
  RoomType,
  Property,
  BedType,
  CreateRoomTypeData,
  UpdateRoomTypeData,
} from '@/types';

const createRoomTypeSchema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  roomSize: z.number().optional(),
  sizeUnit: z.enum(['SQ_FT', 'SQ_M']).optional(),
  adultCapacity: z.number().min(1, 'Adult capacity is required'),
  childCapacity: z.number().min(0, 'Child capacity must be 0 or greater'),
  basePrice: z.number().min(0, 'Base price must be 0 or greater'),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  reserveCondition: z.string().optional(),
  beds: z
    .array(
      z.object({
        bedTypeId: z.string().min(1, 'Bed type is required'),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
      }),
    )
    .default([]),
});

const editRoomTypeSchema = createRoomTypeSchema.partial();

interface RoomTypeFormProps {
  mode: 'create' | 'edit';
  roomType?: RoomType;
  properties: Property[];
  bedTypes: BedType[];
  onSubmit: (data: CreateRoomTypeData | UpdateRoomTypeData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function RoomTypeForm({
  mode,
  roomType,
  properties,
  bedTypes,
  onSubmit,
  onCancel,
  loading = false,
}: RoomTypeFormProps) {
  const schema = mode === 'create' ? createRoomTypeSchema : editRoomTypeSchema;

  const form = useForm<CreateRoomTypeData | UpdateRoomTypeData>({
    resolver: zodResolver(schema),
    defaultValues: {
      propertyId: roomType?.propertyId || '',
      name: roomType?.name || '',
      description: roomType?.description || '',
      roomSize: roomType?.roomSize || undefined,
      sizeUnit: roomType?.sizeUnit || 'SQ_FT',
      adultCapacity: roomType?.adultCapacity || 1,
      childCapacity: roomType?.childCapacity || 0,
      basePrice: roomType?.basePrice || 0,
      amenities: roomType?.amenities || [],
      images: roomType?.images || [],
      reserveCondition: roomType?.reserveCondition || '',
      beds:
        roomType?.beds?.map((bed) => ({
          bedTypeId: bed.bedTypeId,
          quantity: bed.quantity,
        })) || [],
    },
  });

  const handleSubmit = (data: CreateRoomTypeData | UpdateRoomTypeData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="propertyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Room type name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="roomSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room Size</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Room size"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sizeUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size Unit</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SQ_FT">Square Feet</SelectItem>
                    <SelectItem value="SQ_M">Square Meters</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="adultCapacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adult Capacity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Adult capacity"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="childCapacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Child Capacity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Child capacity"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="basePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Base price"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reserveCondition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reserve Condition</FormLabel>
                <FormControl>
                  <Input placeholder="Reserve condition" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Room type description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amenities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amenities</FormLabel>
              <FormControl>
                <TagInput
                  placeholder="Add amenities..."
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Images</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  maxFiles={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <BedConfigurationSection
          beds={form.watch('beds') || []}
          bedTypes={bedTypes}
          onChange={(beds) => form.setValue('beds', beds)}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? 'Saving...'
              : mode === 'create'
                ? 'Create Room Type'
                : 'Update Room Type'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
