'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchGuests, createGuest, updateGuest, deleteGuest } from '@/store/slices/guestSlice';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Star,
  Mail,
  Phone,
  MapPin,
  X,
} from 'lucide-react';
import type { Guest } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNotification } from '@/hooks/useNotification';
import type { AxiosError } from 'axios';
import { handleApiError } from '@/lib/api/error-handler';

export default function GuestsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { guests, loading, pagination } = useSelector(
    (state: RootState) => state.guest,
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [loyaltyFilter, setLoyaltyFilter] = useState('all');
  const [openCreate, setOpenCreate] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const { success, error } = useNotification();

  const LOYALTY_TIER_OPTIONS = ['BRONZE','SILVER','GOLD','PLATINUM'] as const;
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
  const TAG_OPTIONS = [
    'VIP',
    'Regular Customer',
    'Corporate',
    'Long Stay',
    'Walk-in',
    'Online',
    'Family',
    'Honeymoon',
  ];

  useEffect(() => {
    dispatch(
      fetchGuests({
        page: 1,
        limit: 10,
        search: searchTerm || undefined,
        loyaltyTier: loyaltyFilter === 'all' ? undefined : loyaltyFilter,
      }),
    );
  }, [dispatch, searchTerm, loyaltyFilter]);

  const getLoyaltyBadge = (tier: string) => {
    const tierConfig = {
      BRONZE: { color: 'bg-amber-100 text-amber-800', icon: Star },
      SILVER: { color: 'bg-gray-100 text-gray-800', icon: Star },
      GOLD: { color: 'bg-yellow-100 text-yellow-800', icon: Star },
      PLATINUM: { color: 'bg-purple-100 text-purple-800', icon: Star },
    };

    const config =
      tierConfig[tier as keyof typeof tierConfig] || tierConfig.BRONZE;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {tier}
      </Badge>
    );
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const createSchema = z.object({
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
    loyaltyTier: z.enum(['BRONZE','SILVER','GOLD','PLATINUM']).optional(),
    preferences: z.array(z.string()).optional(),
    specialRequests: z.array(z.string()).optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
    isActive: z.boolean().optional().default(true),
  });

  type CreateGuestForm = z.input<typeof createSchema>;
  const form = useForm<CreateGuestForm>({
    resolver: zodResolver(createSchema),
    defaultValues: {
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
    } as any,
  });

  const onSubmit = async (values: CreateGuestForm) => {
    try {
      await (dispatch as AppDispatch)(createGuest(values)).unwrap();
      success('Guest created');
      setOpenCreate(false);
      form.reset({ isActive: true });
      // refetch first page to see new guest and reset filters
      dispatch(fetchGuests({ page: 1, limit: 10 }));
    } catch (e) {
      const apiErr = handleApiError(e as AxiosError);
      error(apiErr.message);
    }
  };

  // Edit form
  const editSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email('Invalid email').optional(),
    phone: z.string().optional(),
    nationality: z.string().optional(),
    dateOfBirth: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
    loyaltyTier: z.enum(['BRONZE','SILVER','GOLD','PLATINUM']).optional(),
    preferences: z.array(z.string()).optional(),
    specialRequests: z.array(z.string()).optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  });

  type EditGuestForm = z.input<typeof editSchema>;
  const editForm = useForm<EditGuestForm>({
    resolver: zodResolver(editSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (openEdit && selectedGuest) {
      editForm.reset({
        firstName: selectedGuest.firstName,
        lastName: selectedGuest.lastName,
        email: selectedGuest.email,
        phone: selectedGuest.phone,
        nationality: selectedGuest.nationality,
        dateOfBirth: selectedGuest.dateOfBirth,
        address: selectedGuest.address,
        city: selectedGuest.city,
        country: selectedGuest.country,
        postalCode: selectedGuest.postalCode,
        loyaltyTier: selectedGuest.loyaltyTier,
        preferences: selectedGuest.preferences || [],
        specialRequests: selectedGuest.specialRequests || [],
        notes: selectedGuest.notes,
        tags: selectedGuest.tags || [],
        isActive: selectedGuest.isActive,
      });
    }
  }, [openEdit, selectedGuest]);

  const onEditSubmit = async (values: EditGuestForm) => {
    if (!selectedGuest) return;
    try {
      await (dispatch as AppDispatch)(updateGuest({ id: selectedGuest.id, data: values })).unwrap();
      success('Guest updated');
      setOpenEdit(false);
      setSelectedGuest(null);
      // Optionally refetch to sync pagination/derived stats
      dispatch(fetchGuests({ page: pagination.page, limit: pagination.limit }));
    } catch (e) {
      const apiErr = handleApiError(e as AxiosError);
      error(apiErr.message);
    }
  };

  const onDeleteConfirm = async () => {
    if (!selectedGuest) return;
    try {
      await (dispatch as AppDispatch)(deleteGuest(selectedGuest.id)).unwrap();
      success('Guest deleted');
      setOpenDelete(false);
      setSelectedGuest(null);
      // Keep current pagination
      dispatch(fetchGuests({ page: pagination.page, limit: pagination.limit }));
    } catch (e) {
      const apiErr = handleApiError(e as AxiosError);
      error(apiErr.message);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Guests</h1>
          <p className="text-muted-foreground mt-1">
            Manage guest profiles and information
          </p>
        </div>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              New Guest
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Guest</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+251912345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="nationality" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nationality</FormLabel>
                    <FormControl>
                      <Input placeholder="Ethiopian" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Street, Area" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Addis Ababa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="country" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COUNTRY_OPTIONS.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="postalCode" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="1000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="loyaltyTier" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loyalty Tier</FormLabel>
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select loyalty tier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LOYALTY_TIER_OPTIONS.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="tags" render={({ field }) => {
                  const selectedTags: string[] = field.value || [];
                  const addTag = (tag: string) => {
                    if (!selectedTags.includes(tag)) field.onChange([...selectedTags, tag]);
                  };
                  const removeTag = (tag: string) => {
                    field.onChange(selectedTags.filter((t) => t !== tag));
                  };
                  return (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedTags.length === 0 ? (
                          <span className="text-sm text-muted-foreground">No tags selected</span>
                        ) : (
                          selectedTags.map((t) => (
                            <Badge key={t} variant="secondary" className="flex items-center gap-1">
                              {t}
                              <button type="button" onClick={() => removeTag(t)} className="ml-1 text-muted-foreground hover:text-foreground">
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))
                        )}
                      </div>
                      <Select onValueChange={addTag}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Add tag" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TAG_OPTIONS.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }} />
                <FormField control={form.control} name="preferences" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Preferences (comma separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="Quiet room, High floor" value={(field.value || []).join(', ')} onChange={(e) => field.onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="specialRequests" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Special Requests (comma separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="Late check-in" value={(field.value || []).join(', ')} onChange={(e) => field.onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} />
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

        {/* View Guest */}
        <Dialog open={openView} onOpenChange={(open) => { setOpenView(open); if (!open) setSelectedGuest(null); }}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Guest Details</DialogTitle>
            </DialogHeader>
            {selectedGuest && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={undefined} />
                    <AvatarFallback>
                      {getInitials(selectedGuest.firstName, selectedGuest.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{selectedGuest.firstName} {selectedGuest.lastName}</div>
                    <div className="text-xs text-muted-foreground">Member since {formatDate(selectedGuest.createdAt)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div className="text-sm">{selectedGuest.email}</div>
                  </div>
                  {selectedGuest.phone && (
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="text-sm">{selectedGuest.phone}</div>
                    </div>
                  )}
                  {(selectedGuest.city || selectedGuest.country) && (
                    <div className="md:col-span-2">
                      <div className="text-sm text-muted-foreground">Location</div>
                      <div className="text-sm">{selectedGuest.city || ''}{selectedGuest.city && selectedGuest.country ? ', ' : ''}{selectedGuest.country || ''}</div>
                    </div>
                  )}
                  {selectedGuest.address && (
                    <div className="md:col-span-2">
                      <div className="text-sm text-muted-foreground">Address</div>
                      <div className="text-sm">{selectedGuest.address}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-muted-foreground">Loyalty Tier</div>
                    <div className="mt-1">{selectedGuest.loyaltyTier ? getLoyaltyBadge(selectedGuest.loyaltyTier) : <Badge variant="outline">No Tier</Badge>}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div className="mt-1"><Badge variant={selectedGuest.isActive ? 'default' : 'secondary'}>{selectedGuest.isActive ? 'Active' : 'Inactive'}</Badge></div>
                  </div>
                  {selectedGuest.tags && selectedGuest.tags.length > 0 && (
                    <div className="md:col-span-2">
                      <div className="text-sm text-muted-foreground">Tags</div>
                      <div className="flex flex-wrap gap-2 mt-1">{selectedGuest.tags.map((t) => (<Badge key={t} variant="secondary">{t}</Badge>))}</div>
                    </div>
                  )}
                  {selectedGuest.preferences && selectedGuest.preferences.length > 0 && (
                    <div className="md:col-span-2">
                      <div className="text-sm text-muted-foreground">Preferences</div>
                      <div className="text-sm">{selectedGuest.preferences.join(', ')}</div>
                    </div>
                  )}
                  {selectedGuest.specialRequests && selectedGuest.specialRequests.length > 0 && (
                    <div className="md:col-span-2">
                      <div className="text-sm text-muted-foreground">Special Requests</div>
                      <div className="text-sm">{selectedGuest.specialRequests.join(', ')}</div>
                    </div>
                  )}
                  {selectedGuest.notes && (
                    <div className="md:col-span-2">
                      <div className="text-sm text-muted-foreground">Notes</div>
                      <div className="text-sm">{selectedGuest.notes}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Guest */}
        <Dialog open={openEdit} onOpenChange={(open) => { setOpenEdit(open); if (!open) setSelectedGuest(null); }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Guest</DialogTitle>
            </DialogHeader>
            {selectedGuest && (
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={editForm.control} name="firstName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={editForm.control} name="lastName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={editForm.control} name="email" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={editForm.control} name="phone" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+251912345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={editForm.control} name="nationality" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nationality</FormLabel>
                      <FormControl>
                        <Input placeholder="Ethiopian" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={editForm.control} name="dateOfBirth" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={editForm.control} name="address" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Street, Area" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={editForm.control} name="city" render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Addis Ababa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={editForm.control} name="country" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select value={field.value || ''} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COUNTRY_OPTIONS.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={editForm.control} name="postalCode" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="1000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={editForm.control} name="loyaltyTier" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loyalty Tier</FormLabel>
                      <Select value={field.value || ''} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select loyalty tier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LOYALTY_TIER_OPTIONS.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={editForm.control} name="tags" render={({ field }) => {
                    const selectedTags: string[] = field.value || [];
                    const addTag = (tag: string) => {
                      if (!selectedTags.includes(tag)) field.onChange([...selectedTags, tag]);
                    };
                    const removeTag = (tag: string) => {
                      field.onChange(selectedTags.filter((t) => t !== tag));
                    };
                    return (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {selectedTags.length === 0 ? (
                            <span className="text-sm text-muted-foreground">No tags selected</span>
                          ) : (
                            selectedTags.map((t) => (
                              <Badge key={t} variant="secondary" className="flex items-center gap-1">
                                {t}
                                <button type="button" onClick={() => removeTag(t)} className="ml-1 text-muted-foreground hover:text-foreground">
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))
                          )}
                        </div>
                        <Select onValueChange={addTag}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Add tag" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TAG_OPTIONS.map((t) => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }} />
                  <FormField control={editForm.control} name="preferences" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Preferences (comma separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="Quiet room, High floor" value={(field.value || []).join(', ')} onChange={(e) => field.onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={editForm.control} name="specialRequests" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Special Requests (comma separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="Late check-in" value={(field.value || []).join(', ')} onChange={(e) => field.onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="md:col-span-2 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setOpenEdit(false)}>Cancel</Button>
                    <Button type="submit" className="bg-primary" disabled={loading}>Save Changes</Button>
                  </div>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Guest */}
        <Dialog open={openDelete} onOpenChange={(open) => { setOpenDelete(open); if (!open) setSelectedGuest(null); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Guest</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete {selectedGuest ? `${selectedGuest.firstName} ${selectedGuest.lastName}` : 'this guest'}? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpenDelete(false)}>Cancel</Button>
                <Button variant="destructive" onClick={onDeleteConfirm} disabled={loading}>Delete</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Guests
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {pagination.total}
            </div>
            <p className="text-xs text-muted-foreground">
              All registered guests
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              VIP Guests
            </CardTitle>
            <Star className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {(guests || []).filter((g) => g.loyaltyTier === 'PLATINUM').length}
            </div>
            <p className="text-xs text-muted-foreground">Platinum members</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New This Month
            </CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {
                (guests || []).filter((g) => {
                  const created = new Date(g.createdAt);
                  const now = new Date();
                  return (
                    created.getMonth() === now.getMonth() &&
                    created.getFullYear() === now.getFullYear()
                  );
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">New registrations</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Guests
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {(guests || []).filter((g) => g.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
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
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={loyaltyFilter} onValueChange={setLoyaltyFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Loyalty Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="BRONZE">Bronze</SelectItem>
                <SelectItem value="SILVER">Silver</SelectItem>
                <SelectItem value="GOLD">Gold</SelectItem>
                <SelectItem value="PLATINUM">Platinum</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Guests Table */}
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Guests</CardTitle>
          <CardDescription>Manage and view all guest profiles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Loyalty Tier</TableHead>
                  <TableHead>Member Since</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading guests...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (guests || []).length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No guests found
                    </TableCell>
                  </TableRow>
                ) : (
                  (guests || []).map((guest) => (
                    <TableRow key={guest.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={undefined} />
                            <AvatarFallback>
                              {getInitials(guest.firstName, guest.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {guest.firstName} {guest.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {guest.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {guest.email}
                          </div>
                          {guest.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {guest.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {guest.city && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              {guest.city}, {guest.country}
                            </div>
                          )}
                          {guest.nationality && (
                            <div className="text-sm text-muted-foreground">
                              {guest.nationality}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {guest.loyaltyTier ? (
                          getLoyaltyBadge(guest.loyaltyTier)
                        ) : (
                          <Badge variant="outline">No Tier</Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(guest.createdAt)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={guest.isActive ? 'default' : 'secondary'}
                        >
                          {guest.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedGuest(guest); setOpenView(true); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedGuest(guest); setOpenEdit(true); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedGuest(guest); setOpenDelete(true); }}>
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
