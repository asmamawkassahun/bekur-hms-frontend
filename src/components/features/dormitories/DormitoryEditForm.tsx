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
import { TagInput } from '@/components/ui/tag-input';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchProperties } from '@/store/slices/propertySlice';
import { fetchBedTypes } from '@/store/slices/bedTypeSlice';
import { createBed, fetchBeds, updateBed, deleteBed, updateBedStatus } from '@/store/slices/bedSlice';
import { useNotification } from '@/hooks/useNotification';
import { handleApiError } from '@/lib/api/error-handler';
import type { AxiosError } from 'axios';
import type { Property, Dormitory, Bed, BedType, BedStatus } from '@/types';
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
    capacity: z.number().int().min(1, 'Capacity must be at least 1'),
    pricePerBed: z.number().min(0, 'Price must be positive'),
    amenities: z.array(z.string()),
    isActive: z.boolean(),
});

// Bed Schema - Frontend form schema (for configuration)
const bedSchema = z.object({
    number: z.string().min(1, 'Bed number is required'),
    typeId: z.string().min(1, 'Bed type is required'),
    price: z.number().min(0, 'Price must be positive'),
    currency: z.string().min(1, 'Currency is required'),
    status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'OUT_OF_ORDER']),
    amenities: z.array(z.string()),
    description: z.string().optional(),
    isActive: z.boolean(),
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
    const { beds: storeBeds, loading: bedsLoading } = useSelector((state: RootState) => state.bed);

    const { success, error } = useNotification();

    const [beds, setBeds] = useState<BedFormData[]>([]);
    const [isCreatingBeds, setIsCreatingBeds] = useState(false);
    const [activeTab, setActiveTab] = useState('dormitory');
    // Batch generator state
    const [batchCount, setBatchCount] = useState<number>(0);
    const [batchPrefix, setBatchPrefix] = useState<string>('');
    const [batchStart, setBatchStart] = useState<number>(1);
    const [batchPrice, setBatchPrice] = useState<number>(0);
    const [batchCurrency, setBatchCurrency] = useState<string>('USD');
    const [batchStatus, setBatchStatus] = useState<(typeof BED_STATUSES)[number]>('AVAILABLE');
    const [batchIsActive, setBatchIsActive] = useState<boolean>(true);
    const [batchBedTypeId, setBatchBedTypeId] = useState<string>('');

    // Map server type values to UI enum values
    const mapDormitoryType = (t: Dormitory['type']): 'MIXED' | 'MALE' | 'FEMALE' => {
        if (t === "Men's") return 'MALE';
        if (t === "Women's") return 'FEMALE';
        return 'MIXED';
    };

    const form = useForm<DormitoryFormData>({
        resolver: zodResolver<DormitoryFormData, any, DormitoryFormData>(dormitorySchema),
        defaultValues: {
            name: dormitory.name,
            propertyId: dormitory.propertyId,
            type: mapDormitoryType(dormitory.type),
            capacity: Number(dormitory.capacity) || 0,
            pricePerBed: typeof dormitory.basePrice === 'string'
                ? parseFloat(dormitory.basePrice)
                : dormitory.basePrice || 0,
            amenities: dormitory.amenities || [],
            isActive: Boolean(dormitory.isActive),
        },
    });

    // Load dropdown data
    useEffect(() => {
        dispatch(fetchProperties({ page: 1, limit: 100 }));
        dispatch(fetchBedTypes({ page: 1, limit: 100 }));
    }, [dispatch]);

    // Default bed type for batch when bed types are loaded
    useEffect(() => {
        if (!batchBedTypeId && (bedTypes || []).length > 0) {
            setBatchBedTypeId((bedTypes[0] as BedType).id);
        }
    }, [bedTypes, batchBedTypeId]);

    // Fetch existing beds for this dormitory when beds tab is active
    useEffect(() => {
        if (activeTab === 'beds' && dormitory.id) {
            dispatch(fetchBeds({ page: 1, limit: 100, dormitoryId: dormitory.id } as any));
        }
    }, [activeTab, dormitory.id, dispatch]);

    // Initialize with one empty bed for adding
    useEffect(() => {
        const dormitoryPrice = typeof dormitory.basePrice === 'string'
            ? parseFloat(dormitory.basePrice)
            : dormitory.basePrice || 0;
        const initialBeds: BedFormData[] = [{
            number: '',
            typeId: batchBedTypeId || '',
            price: dormitoryPrice,
            currency: 'USD',
            status: 'AVAILABLE',
            amenities: [],
            description: '',
            isActive: true,
        }];
        setBeds(initialBeds);
        // Initialize batch generator defaults
        setBatchPrefix(dormitory.name);
        setBatchPrice(dormitoryPrice);
        setBatchCurrency('USD');
        setBatchStatus('AVAILABLE');
        setBatchIsActive(true);
        setBatchCount(0);
        setBatchStart(1);
    }, [dormitory.basePrice]);

    const handleSubmit = (values: DormitoryFormData) => {
        // Transform payload to match backend API expectations
        const payload = {
            name: values.name,
            propertyId: values.propertyId,
            type: values.type,
            capacity: values.capacity,
            basePrice: Number(values.pricePerBed) || 0, // Backend expects basePrice as number
            amenities: (values.amenities || []).map((s) => s.trim()).filter(Boolean),
            isActive: values.isActive,
        };
        onSubmit(payload as any);
    };

    const handleAddBed = () => {
        const newBed: BedFormData = {
            number: '',
            typeId: batchBedTypeId || '',
            price: form.getValues('pricePerBed'),
            currency: 'USD',
            status: 'AVAILABLE',
            amenities: [],
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

    const generateBedsBatch = () => {
        if (batchCount <= 0) return;
        const newBeds: BedFormData[] = Array.from({ length: batchCount }).map((_, idx) => {
            const seq = batchStart + idx;
            const number = `${batchPrefix}-${seq}`;
            return {
                number,
                typeId: batchBedTypeId || '',
                price: batchPrice,
                currency: batchCurrency,
                status: batchStatus,
                amenities: [],
                description: '',
                isActive: batchIsActive,
            };
        });
        setBeds((prev) => [...prev, ...newBeds]);
        setBatchStart(batchStart + batchCount);
    };

    // Auto-generate beds when count changes (no button needed)
    const regenerateBeds = (count: number, startOverride?: number) => {
        if (!count || count <= 0) {
            setBeds([]);
            return;
        }
        const effectivePrefix = batchPrefix || dormitory.name;
        const startFrom = typeof startOverride === 'number' ? startOverride : batchStart;
        const newBeds: BedFormData[] = Array.from({ length: count }).map((_, idx) => {
            const seq = startFrom + idx;
            const number = `${effectivePrefix}-${seq}`;
            return {
                number,
                typeId: batchBedTypeId || '',
                price: batchPrice,
                currency: batchCurrency,
                status: batchStatus,
                amenities: [],
                description: '',
                isActive: batchIsActive,
            };
        });
        setBeds(newBeds);
    };

    // Auto-adjust starting index to avoid duplicates based on existing beds
    const getNextAvailableStart = (prefix: string): number => {
        const existing = (storeBeds || []).filter((b) => b.dormitoryId === dormitory.id);
        let maxSeq = 0;
        const normalizedPrefix = prefix || dormitory.name;
        existing.forEach((b) => {
            const num = b.number || '';
            if (num.startsWith(`${normalizedPrefix}-`)) {
                const tail = num.slice((`${normalizedPrefix}-`).length);
                const parsed = parseInt(tail, 10);
                if (!isNaN(parsed)) {
                    maxSeq = Math.max(maxSeq, parsed);
                }
            }
        });
        return maxSeq + 1;
    };

    useEffect(() => {
        if (activeTab === 'beds') {
            const nextStart = getNextAvailableStart(batchPrefix);
            setBatchStart(nextStart);
            if (batchCount > 0) {
                regenerateBeds(batchCount, nextStart);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storeBeds, batchPrefix, activeTab]);

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
                    bedTypeId: bedData.typeId,
                    status: bedData.status,
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
                amenities: [],
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

    // Existing beds editing helpers
    const [editRows, setEditRows] = useState<Record<string, { number: string; basePrice: number; status: BedStatus; isActive: boolean; bedTypeId: string }>>({});

    useEffect(() => {
        const init: Record<string, { number: string; basePrice: number; status: BedStatus; isActive: boolean; bedTypeId: string }> = {};
        (storeBeds || [])
            .filter((b) => b.dormitoryId === dormitory.id)
            .forEach((b) => {
                init[b.id] = {
                    number: b.number,
                    basePrice: typeof b.basePrice === 'string' ? Number(b.basePrice) : b.basePrice,
                    status: b.status as BedStatus,
                    isActive: b.isActive,
                    bedTypeId: (b as any)?.bedTypeId || (b as any)?.bedType?.id || '',
                };
            });
        setEditRows(init);
    }, [storeBeds, dormitory.id]);

    const handleEditRowChange = (id: string, field: 'number' | 'basePrice' | 'status' | 'isActive' | 'bedTypeId', value: any) => {
        setEditRows((prev) => ({
            ...prev,
            [id]: { ...prev[id], [field]: value },
        }));
    };

    const handleSaveExistingBed = async (bed: Bed) => {
        const current = editRows[bed.id];
        if (!current) return;
        try {
            // Update number/basePrice/isActive
            await dispatch(
                updateBed({
                    id: bed.id,
                    data: {
                        number: current.number,
                        basePrice: Number(current.basePrice) || 0,
                        isActive: current.isActive,
                        bedTypeId: current.bedTypeId || undefined,
                    },
                } as any),
            ).unwrap();

            // Update status if changed
            if (current.status !== bed.status) {
                await dispatch(
                    updateBedStatus({ id: bed.id, data: { status: current.status } } as any),
                ).unwrap();
            }
            success('Bed updated');
        } catch (e) {
            const apiErr = handleApiError(e as AxiosError);
            error(apiErr.message);
        }
    };

    const handleDeleteExistingBed = async (bedId: string) => {
        try {
            await dispatch(deleteBed(bedId) as any).unwrap();
            success('Bed deleted');
        } catch (e) {
            const apiErr = handleApiError(e as AxiosError);
            error(apiErr.message);
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
                                        <TagInput
                                            value={field.value || []}
                                            onChange={field.onChange}
                                            placeholder="Type an amenity and press Enter"
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

                    {/* Batch generator */}
                    <div className="border rounded-lg p-3 space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            <div>
                                <label className="text-xs font-medium">How many beds?</label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={batchCount}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setBatchCount(val);
                                        regenerateBeds(val);
                                    }}
                                    className="h-8"
                                    disabled={isCreatingBeds || loading}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium">Prefix</label>
                                <Input
                                    value={batchPrefix}
                                    onChange={(e) => setBatchPrefix(e.target.value)}
                                    className="h-8"
                                    disabled={isCreatingBeds || loading}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium">Start #</label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={batchStart}
                                    onChange={(e) => setBatchStart(Number(e.target.value))}
                                    className="h-8"
                                    disabled={isCreatingBeds || loading}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium">Bed Type</label>
                                <Select
                                    value={batchBedTypeId}
                                    onValueChange={(val) => setBatchBedTypeId(val)}
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
                                    value={batchPrice}
                                    onChange={(e) => setBatchPrice(Number(e.target.value))}
                                    className="h-8"
                                    disabled={isCreatingBeds || loading}
                                />
                            </div>
                            {/* <div>
                                <label className="text-xs font-medium">Currency</label>
                                <Select
                                    value={batchCurrency}
                                    onValueChange={(val) => setBatchCurrency(val)}
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
                            </div> */}
                            <div>
                                <label className="text-xs font-medium">Status</label>
                                <Select
                                    value={batchStatus}
                                    onValueChange={(val) => setBatchStatus(val as (typeof BED_STATUSES)[number])}
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
                        </div>
                        <div className="flex items-center justify-between">
                            <div className='flex items-center gap-3'>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        checked={batchIsActive}
                                        onCheckedChange={(checked) => setBatchIsActive(Boolean(checked))}
                                        disabled={isCreatingBeds || loading}
                                    />
                                    <label className="text-xs font-medium">Active</label>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    Auto number as: {batchPrefix || dormitory.name}-{batchStart} ...
                                </span>
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
                    </div>

                    <div className="space-y-4 max-h-80 overflow-y-auto">
                        {/* Existing Beds */}
                        {(storeBeds || []).filter((b) => b.dormitoryId === dormitory.id).length > 0 && (
                            <div className="space-y-2">
                                <div className="text-sm font-medium">Existing Beds</div>
                                <div className="space-y-2">
                                    {(storeBeds || [])
                                        .filter((b) => b.dormitoryId === dormitory.id)
                                        .map((b) => (
                                            <div key={b.id} className="border rounded-lg p-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-2">
                                                        <div>
                                                            <label className="text-xs font-medium">Number</label>
                                                            <Input
                                                                value={editRows[b.id]?.number ?? b.number}
                                                                onChange={(e) => handleEditRowChange(b.id, 'number', e.target.value)}
                                                                className="h-8"
                                                                disabled={isCreatingBeds || loading}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium">Bed Type</label>
                                                            <Select
                                                                value={editRows[b.id]?.bedTypeId ?? ((b as any)?.bedTypeId || (b as any)?.bedType?.id || '')}
                                                                onValueChange={(val) => handleEditRowChange(b.id, 'bedTypeId', val)}
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
                                                                value={editRows[b.id]?.basePrice ?? (typeof b.basePrice === 'string' ? Number(b.basePrice) : b.basePrice)}
                                                                onChange={(e) => handleEditRowChange(b.id, 'basePrice', Number(e.target.value))}
                                                                className="h-8"
                                                                disabled={isCreatingBeds || loading}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div>
                                                            <label className="text-xs font-medium">Status</label>
                                                            <Select
                                                                value={editRows[b.id]?.status ?? (b.status as BedStatus)}
                                                                onValueChange={(val) => handleEditRowChange(b.id, 'status', val as BedStatus)}
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
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                checked={editRows[b.id]?.isActive ?? b.isActive}
                                                                onCheckedChange={(checked) => handleEditRowChange(b.id, 'isActive', Boolean(checked))}
                                                                disabled={isCreatingBeds || loading}
                                                            />
                                                            <label className="text-xs font-medium">Active</label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-2 mt-2">
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        className="cursor-pointer"
                                                        onClick={() => handleDeleteExistingBed(b.id)}
                                                        disabled={isCreatingBeds || loading}
                                                    >
                                                        Delete
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        onClick={() => handleSaveExistingBed(b)}
                                                        className="bg-primary cursor-pointer"
                                                        disabled={isCreatingBeds || loading}
                                                    >
                                                        Save
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}


                        {/* {beds.map((bed, index) => (
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
                                </div> */}

                        {/* <div className="grid grid-cols-2 gap-3"> */}
                        {/* Left Column */}
                        {/* <div className="space-y-3">
                                        <div>
                                            <label className="text-xs font-medium">Bed Number</label>
                                            <Input
                                                value={bed.number}
                                                onChange={(e) => handleUpdateBed(index, 'number', e.target.value)}
                                                placeholder="A1, B2, etc."
                                                className="h-8"
                                                disabled={isCreatingBeds || loading}
                                            />
                                        </div> */}

                        {/* <div>
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
                                        </div> */}

                        {/* <div>
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
                                        </div> */}

                        {/* <div>
                                            <label className="text-xs font-medium">Amenities</label>
                                            <Input
                                                placeholder="Pillow, Blanket, Locker, Power Outlet"
                                                value={bed.amenities || ''}
                                                onChange={(e) => handleUpdateBed(index, 'amenities', e.target.value)}
                                                className="h-8"
                                                disabled={isCreatingBeds || loading}
                                            />
                                        </div> */}

                        {/* <div>
                                            <label className="text-xs font-medium">Description</label>
                                            <Textarea
                                                placeholder="Bed description..."
                                                value={bed.description || ''}
                                                onChange={(e) => handleUpdateBed(index, 'description', e.target.value)}
                                                className="h-16 resize-none"
                                                disabled={isCreatingBeds || loading}
                                            />
                                        </div> */}
                    {/* </div> */}

                    {/* Right Column */}
                    {/* <div className="space-y-3">
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
                                        </div> */}

                    {/* <div>
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
                                        </div> */}
                    {/* </div>
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
                        ))} */}
                </div>


                </div>
            </TabsContent>
        </Tabs>
    );
}
