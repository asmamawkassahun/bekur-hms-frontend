import React from 'react';
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
import { TagInput } from '@/components/ui/tag-input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Guest, FileType } from '@/types';
import { DocumentUpload } from './DocumentUpload';

const LOYALTY_TIER_OPTIONS = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'] as const;
const COUNTRY_OPTIONS = [
  'Ethiopia',
  'United States',
  'United Kingdom',
  'Kenya',
  'Nigeria',
  'South Africa',
  'Germany',
  'France',
  'Italy',
  'United Arab Emirates',
  'China',
  'India',
];

const guestSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone is required'),
  nationality: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  loyaltyTier: z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']).optional(),
  preferences: z.array(z.string()).optional(),
  specialRequests: z.array(z.string()).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional().default(true),
  // Document upload fields (only required for creation, not editing)
  documents: z.object({
    front: z.instanceof(File).optional(),
    back: z.instanceof(File).optional(),
  }).optional(),
});

type GuestFormData = z.input<typeof guestSchema>;

interface GuestFormProps {
  guest?: Guest;
  onSubmit: (data: GuestFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  isCreating?: boolean; // New prop to distinguish between create and edit modes
}

export function GuestForm({
  guest,
  onSubmit,
  onCancel,
  loading = false,
  isCreating = false,
}: GuestFormProps) {
  const form = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: guest
      ? {
          firstName: guest.firstName,
          lastName: guest.lastName,
          email: guest.email,
          phone: guest.phone,
          nationality: guest.nationality,
          dateOfBirth: guest.dateOfBirth,
          address: guest.address,
          city: guest.city,
          country: guest.country,
          postalCode: guest.postalCode,
          loyaltyTier: guest.loyaltyTier,
          preferences: guest.preferences || [],
          specialRequests: guest.specialRequests || [],
          notes: guest.notes,
          tags: guest.tags || [],
          isActive: guest.isActive,
          documents: undefined, // No documents for editing
        }
      : {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          nationality: '',
          dateOfBirth: '',
          address: '',
          city: '',
          country: '',
          postalCode: '',
          loyaltyTier: undefined,
          preferences: [],
          specialRequests: [],
          notes: '',
          tags: [],
          isActive: true,
          documents: {
            front: undefined,
            back: undefined,
          },
        },
  });

  const handleSubmit = (values: GuestFormData) => {
    // For creation mode, validate that both documents are provided
    if (isCreating && values.documents) {
      if (!values.documents.front || !values.documents.back) {
        form.setError('documents', {
          type: 'manual',
          message: 'Both ID card front and back are required',
        });
        return;
      }
    }

    const payload = {
      ...values,
      // Keep arrays as arrays for backend
      preferences: values.preferences || [],
      specialRequests: values.specialRequests || [],
      tags: values.tags || [],
    };
    onSubmit(payload as GuestFormData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Two-column grid for short fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+251912345678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nationality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nationality</FormLabel>
                <FormControl>
                  <Input placeholder="Ethiopian" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Street, Area" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Addis Ababa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <Select
                  value={field.value || ''}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COUNTRY_OPTIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
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
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input placeholder="1000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="loyaltyTier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loyalty Tier</FormLabel>
                <Select
                  value={field.value || ''}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select loyalty tier" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LOYALTY_TIER_OPTIONS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Document Upload Section - Only for creation */}
        {isCreating && (
          <FormField
            control={form.control}
            name="documents"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <DocumentUpload
                    value={{
                      front: field.value?.front ?? null,
                      back: field.value?.back ?? null,
                    }}
                    onChange={field.onChange}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Tag Input Fields */}
        <FormField
          control={form.control}
          name="preferences"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferences</FormLabel>
              <FormControl>
                <TagInput
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder="Type preference and press comma"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specialRequests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Requests</FormLabel>
              <FormControl>
                <TagInput
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder="Type request and press comma"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <TagInput
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder="Type tag and press comma"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
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
            {guest ? 'Save Changes' : 'Create'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
