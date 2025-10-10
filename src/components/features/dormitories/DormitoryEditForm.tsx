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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchProperties } from '@/store/slices/propertySlice';
import { fetchBedTypes } from '@/store/slices/bedTypeSlice';
import { createBed } from '@/store/slices/bedSlice';
import { useNotification } from '@/hooks/useNotification';
import { handleApiError } from '@/lib/api/error-handler';
import type { AxiosError } from 'axios';
import type { Property, Dormitory, Bed, BedType } from '@/types';
import { Plus, Trash2, Check } from 'lucide-react';

const DORMITORY_TYPES = ['MIXED', 'MALE', 'FEMALE'] as const;

const BED_STATUSES = [
    'AVAILABLE',
    'OCCUPIED',
    'MAINTENANCE',
    'OUT_OF_ORDER',
] as const;

const CURRENCIES = [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'INR', label: 'INR - Indian Rupee' },
    { value: 'NGN', label: 'NGN - Nigerian Naira' },
] as const;

// Dormitory Schema - Only fields accepted by backend API
const dormitorySchema = z.object({
    name: z.string().min(1, 'Dormitory name is required'),
    propertyId: z.string().min(1, 'Property is required'),
    type: z.enum(['MIXED', 'MALE', 'FEMALE']),
    capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1'),
    pricePerBed: z.coerce.number().min(0, 'Price must be positive'),
    amenities: z.string().optional(),
    isActive: z.boolean().default(true),
});

// Bed Schema - Frontend form schema (for configuration)
const bedSchema = z.object({
    number: z.string().min(1, 'Bed number is required'),
    typeId: z.string().min(1, 'Bed type is required'),
    price: z.coerce.number().min(0, 'Price must be positive'),
    currency: z.string().min(1, 'Currency is required'),
    status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'OUT_OF_ORDER']),
    amenities: z.string().optional(),
    description: z.string().optional(),
    isActive: z.boolean().default(true),
});

type DormitoryFormData = z.infer<typeof dormitorySchema>;
type BedFormData = z.infer<typeof bedSchema>;

interface DormitoryEditFormProps {
    dormitory: Dormitory;
    onSubmit: (data: DormitoryFormData) => void;
    onCancel: () => void;
    loading?: boolean;
}

export function DormitoryEditForm({
    dormitory,
    onSubmit,
    onCancel,
    loading = false,
}: DormitoryEditFormProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { properties } = useSelector((state: RootState) => state.property);
    const { bedTypes } = useSelector((state: RootState) => state.bedType);

    const { success, error } = useNotification();

    const [beds, setBeds] = useState<BedFormData[]>([]);
    const [isCreatingBeds, setIsCreatingBeds] = useState(false);
    const [activeTab, setActiveTab] = useState('dormitory');

    const form = useForm<DormitoryFormData>({
        resolver: zodResolver(dormitorySchema),
        defaultValues: {
            name: dormitory.name,
            propertyId: dormitory.propertyId,
            type: dormitory.type,
            capacity: dormitory.capacity,
            pricePerBed: typeof dormitory.basePrice === 'string'
                ? parseFloat(dormitory.basePrice)
                : dormitory.basePrice || 0,
            amenities: dormitory.amenities?.join(', ') || '',
            isActive: dormitory.isActive,
        },
    });

    // Load dropdown data
    useEffect(() => {
        dispatch(fetchProperties({ page: 1, limit: 100 }));
        dispatch(fetchBedTypes({ page: 1, limit: 100 }));
    }, [dispatch]);

    // Initialize with one empty bed for adding
    useEffect(() => {
        const dormitoryPrice = typeof dormitory.basePrice === 'string'
            ? parseFloat(dormitory.basePrice)
            : dormitory.basePrice || 0;
        const initialBeds: BedFormData[] = [{
            number: '',
            typeId: '',
            price: dormitoryPrice,
            currency: 'USD',
            status: 'AVAILABLE',
            amenities: '',
            description: '',
            isActive: true,
        }];
        setBeds(initialBeds);
    }, [dormitory.basePrice]);

    const handleSubmit = (values: DormitoryFormData) => {
        // Transform payload to match backend API expectations
        const payload = {
            name: values.name,
            propertyId: values.propertyId,
            type: values.type,
            capacity: values.capacity,
            basePrice: Number(values.pricePerBed) || 0, // Backend expects basePrice as number
            amenities: values.amenities ? values.amenities.split(',').map(s => s.trim()).filter(Boolean) : [],
            isActive: values.isActive,
        };
        onSubmit(payload as any);
    };

    const handleAddBed = () => {
        const newBed: BedFormData = {
            number: '',
            typeId: '',
            price: form.getValues('pricePerBed'),
            currency: 'USD',
            status: 'AVAILABLE',
            amenities: '',
            description: '',
            isActive: true,
        };
        setBeds([...beds, newBed]);
    };

    const handleRemoveBed = (index: number) => {
        setBeds(beds.filter((_, i) => i !== index));
    };

    const handleUpdateBed = (index: number, field: keyof BedFormData, value: any) => {
        const updatedBeds = [...beds];
        updatedBeds[index] = { ...updatedBeds[index], [field]: value };
        setBeds(updatedBeds);
    };

    const handleCreateBeds = async () => {
        setIsCreatingBeds(true);
        try {
            const createdBeds: Bed[] = [];

            for (const bedData of beds) {
                // Backend only accepts: dormitoryId, number, basePrice, isActive
                const payload = {
                    dormitoryId: dormitory.id,
                    number: bedData.number,
                    basePrice: Number(bedData.price) || 0,
                    isActive: bedData.isActive,
                };

                console.log('📝 Creating bed with payload:', payload);
                const response = await dispatch(createBed(payload as any)).unwrap();
                const bedResult = response.data || response;
                createdBeds.push(bedResult as Bed);
            }

            success(`${createdBeds.length} beds created successfully!`);

            // Clear the beds form after successful creation
            setBeds([{
                number: '',
                typeId: '',
                price: form.getValues('pricePerBed'),
                currency: 'USD',
                status: 'AVAILABLE',
                amenities: '',
                description: '',
                isActive: true,
            }]);
        } catch (e) {
            const apiErr = handleApiError(e as AxiosError);
            error(apiErr.message);
        } finally {
            setIsCreatingBeds(false);
        }
    };

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="dormitory">Dormitory Details</TabsTrigger>
                <TabsTrigger value="beds">Manage Beds</TabsTrigger>
            </TabsList>

            <TabsContent value="dormitory" className="space-y-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dormitory Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Dormitory A" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="propertyId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Property</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
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
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {DORMITORY_TYPES.map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type}
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
                                name="capacity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Capacity (Beds)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
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
                                name="pricePerBed"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price Per Bed</FormLabel>
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
                        </div>

                        {/* Amenities */}
                        <FormField
                            control={form.control}
                            name="amenities"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amenities (optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="WiFi, Lockers, Shared Bathroom, Common Area"
                                            {...field}
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
                                        <FormLabel>Active Dormitory</FormLabel>
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
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Form>
            </TabsContent>

            <TabsContent value="beds" className="space-y-4">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">
                                {beds.length} bed{beds.length !== 1 ? 's' : ''}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                Dormitory: {dormitory.name}
                            </span>
                        </div>
                        <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                            Manually enter bed numbers (A1, B2, etc.) - configure details for each bed
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddBed}
                            className="cursor-pointer"
                            disabled={isCreatingBeds || loading}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Bed
                        </Button>
                    </div>

                    <div className="space-y-4 max-h-80 overflow-y-auto">
                        {beds.map((bed, index) => (
                            <div key={index} className="border rounded-lg p-4 space-y-4 bg-card">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-sm">Bed {bed.number || `${index + 1}`}</h4>
                                    {beds.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveBed(index)}
                                            className="text-destructive hover:text-destructive cursor-pointer h-6 w-6 p-0"
                                            disabled={isCreatingBeds || loading}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {/* Left Column */}
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs font-medium">Bed Number</label>
                                            <Input
                                                value={bed.number}
                                                onChange={(e) => handleUpdateBed(index, 'number', e.target.value)}
                                                placeholder="A1, B2, etc."
                                                className="h-8"
                                                disabled={isCreatingBeds || loading}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium">Bed Type</label>
                                            <Select
                                                value={bed.typeId}
                                                onValueChange={(value) => handleUpdateBed(index, 'typeId', value)}
                                                disabled={isCreatingBeds || loading}
                                            >
                                                <SelectTrigger className="h-8">
                                                    <SelectValue placeholder="Select bed type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(bedTypes || []).map((bt: BedType) => (
                                                        <SelectItem key={bt.id} value={bt.id}>
                                                            {bt.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium">Price</label>
                                            <Input
                                                type="number"
                                                min={0}
                                                step="0.01"
                                                value={bed.price}
                                                onChange={(e) => handleUpdateBed(index, 'price', Number(e.target.value))}
                                                className="h-8"
                                                disabled={isCreatingBeds || loading}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium">Amenities</label>
                                            <Input
                                                placeholder="Pillow, Blanket, Locker, Power Outlet"
                                                value={bed.amenities || ''}
                                                onChange={(e) => handleUpdateBed(index, 'amenities', e.target.value)}
                                                className="h-8"
                                                disabled={isCreatingBeds || loading}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium">Description</label>
                                            <Textarea
                                                placeholder="Bed description..."
                                                value={bed.description || ''}
                                                onChange={(e) => handleUpdateBed(index, 'description', e.target.value)}
                                                className="h-16 resize-none"
                                                disabled={isCreatingBeds || loading}
                                            />
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs font-medium">Dormitory</label>
                                            <div className="h-8 flex items-center px-3 bg-muted rounded-md text-sm text-muted-foreground">
                                                {dormitory.name}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium">Status</label>
                                            <Select
                                                value={bed.status}
                                                onValueChange={(value) => handleUpdateBed(index, 'status', value)}
                                                disabled={isCreatingBeds || loading}
                                            >
                                                <SelectTrigger className="h-8">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {BED_STATUSES.map((status) => (
                                                        <SelectItem key={status} value={status}>
                                                            {status}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium">Currency</label>
                                            <Select
                                                value={bed.currency}
                                                onValueChange={(value) => handleUpdateBed(index, 'currency', value)}
                                                disabled={isCreatingBeds || loading}
                                            >
                                                <SelectTrigger className="h-8">
                                                    <SelectValue placeholder="Select currency" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {CURRENCIES.map((currency) => (
                                                        <SelectItem key={currency.value} value={currency.value}>
                                                            {currency.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        checked={bed.isActive}
                                        onCheckedChange={(checked) => handleUpdateBed(index, 'isActive', checked)}
                                        disabled={isCreatingBeds || loading}
                                    />
                                    <label className="text-xs font-medium">Active Bed</label>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="cursor-pointer"
                            onClick={onCancel}
                            disabled={isCreatingBeds || loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleCreateBeds}
                            className="bg-primary cursor-pointer"
                            disabled={isCreatingBeds || loading}
                        >
                            {isCreatingBeds ? 'Creating Beds...' : `Create ${beds.length} Beds`}
                            <Check className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    );
}
