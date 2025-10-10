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
import { TagInput } from '@/components/ui/tag-input';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchProperties } from '@/store/slices/propertySlice';
import { fetchBedTypes } from '@/store/slices/bedTypeSlice';
import { createDormitory } from '@/store/slices/dormitorySlice';
import { createBed } from '@/store/slices/bedSlice';
import { useNotification } from '@/hooks/useNotification';
import { handleApiError } from '@/lib/api/error-handler';
import type { AxiosError } from 'axios';
import type { Property, BedType, Dormitory, Bed } from '@/types';
import { Plus, Trash2, Check, ArrowLeft, ArrowRight } from 'lucide-react';

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

interface DormitoryWizardFormProps {
  onSubmit: (dormitory: Dormitory, beds: Bed[]) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function DormitoryWizardFormCompact({
  onSubmit,
  onCancel,
  loading = false,
}: DormitoryWizardFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { properties } = useSelector((state: RootState) => state.property);
  const { bedTypes } = useSelector((state: RootState) => state.bedType);
  const { success, error } = useNotification();

  const [currentStep, setCurrentStep] = useState(1);
  const [createdDormitory, setCreatedDormitory] = useState<Dormitory | null>(null);
  const [beds, setBeds] = useState<BedFormData[]>([]);
  const [isCreatingDormitory, setIsCreatingDormitory] = useState(false);
  const [isCreatingBeds, setIsCreatingBeds] = useState(false);
  // Bed batch generator controls
  const [batchCount, setBatchCount] = useState<number>(0);
  const [batchPrefix, setBatchPrefix] = useState<string>('');
  const [batchStart, setBatchStart] = useState<number>(1);
  const [batchPrice, setBatchPrice] = useState<number>(0);
  const [batchCurrency, setBatchCurrency] = useState<string>('USD');
  const [batchStatus, setBatchStatus] = useState<(typeof BED_STATUSES)[number]>('AVAILABLE');
  const [batchIsActive, setBatchIsActive] = useState<boolean>(true);

  // Dormitory form
  const dormitoryForm = useForm<DormitoryFormData>({
    resolver: zodResolver<DormitoryFormData, any, DormitoryFormData>(dormitorySchema),
    defaultValues: {
      name: '',
      propertyId: '',
      type: 'MIXED',
      capacity: 4,
      pricePerBed: 0,
      amenities: [],
      isActive: true,
    },
  });

  // Bed form
  const bedForm = useForm<BedFormData>({
    resolver: zodResolver<BedFormData, any, BedFormData>(bedSchema),
    defaultValues: {
      number: '',
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
    dispatch(fetchProperties({ page: 1, limit: 100 }));
    dispatch(fetchBedTypes({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Initialize generator defaults when dormitory is created
  useEffect(() => {
    if (createdDormitory) {
      setBeds([]);
      const defaultPrefix = `${createdDormitory.name}`;
      setBatchPrefix(defaultPrefix);
      setBatchPrice(dormitoryForm.getValues('pricePerBed'));
      setBatchCurrency('USD');
      setBatchStatus('AVAILABLE');
      setBatchIsActive(true);
      setBatchCount(0);
      setBatchStart(1);
    }
  }, [createdDormitory, dormitoryForm]);

  const generateBedsBatch = () => {
    if (!createdDormitory || batchCount <= 0) return;
    const newBeds: BedFormData[] = Array.from({ length: batchCount }).map((_, idx) => {
      const seq = batchStart + idx;
      const number = `${batchPrefix}-${seq}`;
      return {
        number,
        typeId: '',
        price: batchPrice,
        currency: batchCurrency,
        status: batchStatus,
        amenities: [],
        description: '',
        isActive: batchIsActive,
      };
    });
    setBeds((prev) => [...prev, ...newBeds]);
    // advance starting number for next batch
    setBatchStart(batchStart + batchCount);
    // keep other settings to allow quick subsequent batches
  };

  const handleDormitorySubmit: SubmitHandler<DormitoryFormData> = async (values) => {
    setIsCreatingDormitory(true);
    try {
      console.log('📝 Raw form values:', values);

      // Transform payload to match backend API expectations
      const payload = {
        name: values.name,
        propertyId: values.propertyId,
        type: values.type,
        capacity: values.capacity,
        basePrice: Number(values.pricePerBed) || 0, // Backend expects basePrice as number
        amenities: (values.amenities || []).map(s => s.trim()).filter(Boolean),
        isActive: values.isActive,
      };

      console.log('📝 Creating dormitory with payload:', payload);

      const response = await dispatch(createDormitory(payload as any)).unwrap();
      console.log('✅ Dormitory created, response:', response);

      // Check if response has data property
      const dormitoryData = response.data || response;
      setCreatedDormitory(dormitoryData as Dormitory);
      success('Dormitory created successfully!');
      setCurrentStep(2);
    } catch (e) {
      console.error('❌ Failed to create dormitory:', e);
      console.error('❌ Error details:', {
        message: (e as any)?.message,
        response: (e as any)?.response,
        status: (e as any)?.response?.status,
        data: (e as any)?.response?.data,
      });
      const apiErr = handleApiError(e as AxiosError);
      error(apiErr.message);
    } finally {
      setIsCreatingDormitory(false);
    }
  };

  const handleAddBed = () => {
    const newBed: BedFormData = {
      number: '',
      typeId: '',
      price: dormitoryForm.getValues('pricePerBed'),
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

  const handleBedsSubmit = async () => {
    if (!createdDormitory) return;

    setIsCreatingBeds(true);
    try {
      const createdBeds: Bed[] = [];

      for (const bedData of beds) {
        // Backend only accepts: dormitoryId, number, basePrice, isActive
        // We configure the full form but only send what the API accepts
        const payload = {
          dormitoryId: createdDormitory.id,
          number: bedData.number,
          basePrice: Number(bedData.price) || 0,
          status: bedData.status,
          isActive: bedData.isActive,
        };

        console.log('📝 Creating bed with payload:', payload);
        console.log('📝 Full bed configuration (not sent to API):', bedData);
        const response = await dispatch(createBed(payload as any)).unwrap();
        const bedResult = response.data || response;
        createdBeds.push(bedResult as Bed);
      }

      success(`${createdBeds.length} beds created successfully!`);
      onSubmit(createdDormitory, createdBeds);
    } catch (e) {
      const apiErr = handleApiError(e as AxiosError);
      error(apiErr.message);
    } finally {
      setIsCreatingBeds(false);
    }
  };

  const handleSkipBeds = () => {
    if (createdDormitory) {
      onSubmit(createdDormitory, []);
    }
  };

  const renderDormitoryForm = () => (
    <Form {...dormitoryForm}>
      <form onSubmit={dormitoryForm.handleSubmit(handleDormitorySubmit)} className="space-y-4">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={dormitoryForm.control}
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
            control={dormitoryForm.control}
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
            control={dormitoryForm.control}
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
            control={dormitoryForm.control}
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
            control={dormitoryForm.control}
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
          control={dormitoryForm.control}
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
          control={dormitoryForm.control}
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
            disabled={isCreatingDormitory}
          >
            {isCreatingDormitory ? 'Creating...' : 'Next: Configure Beds'}
          </Button>
        </div>
      </form>
    </Form>
  );

  const renderBedsForm = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {beds.length} bed{beds.length !== 1 ? 's' : ''}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Dormitory: {createdDormitory?.name}
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
              onChange={(e) => setBatchCount(Number(e.target.value))}
              className="h-8"
              disabled={isCreatingBeds || loading}
            />
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
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={batchIsActive}
              onCheckedChange={(checked) => setBatchIsActive(Boolean(checked))}
            />
            <label className="text-xs font-medium">Active</label>
          </div>
          <Button
            type="button"
            onClick={generateBedsBatch}
            className="cursor-pointer"
            disabled={isCreatingBeds || loading || !createdDormitory || batchCount <= 0}
          >
            Generate Beds
          </Button>
          <span className="text-xs text-muted-foreground">
            Auto number as: {batchPrefix || createdDormitory?.name}-{batchStart} ...
          </span>
        </div>
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

                {/* <div>
                  <label className="text-xs font-medium">Amenities</label>
                  <TagInput
                    value={(bed.amenities as string[]) || []}
                    onChange={(value) => handleUpdateBed(index, 'amenities', value)}
                    placeholder="Type and press Enter"
                    className=""
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
                </div> */}
              </div>

              {/* Right Column */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium">Dormitory</label>
                  <div className="h-8 flex items-center px-3 bg-muted rounded-md text-sm text-muted-foreground">
                    {createdDormitory?.name || 'Selected Dormitory'}
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
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={bed.isActive}
                onCheckedChange={(checked) => handleUpdateBed(index, 'isActive', checked)}
              />
              <label className="text-xs font-medium">Active Bed</label>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(1)}
          className="cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleSkipBeds}
            className="cursor-pointer"
          >
            Skip Beds
          </Button>
          <Button
            type="button"
            onClick={handleBedsSubmit}
            disabled={isCreatingBeds || beds.length === 0}
            className="bg-primary cursor-pointer"
          >
            {isCreatingBeds ? 'Creating...' : `Create ${beds.length} Bed${beds.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
            {currentStep > 1 ? <Check className="h-3 w-3" /> : '1'}
          </div>
          <span className="text-sm font-medium">Dormitory</span>
        </div>
        <div className="w-6 h-px bg-muted" />
        <div className="flex items-center space-x-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
            {currentStep > 2 ? <Check className="h-3 w-3" /> : '2'}
          </div>
          <span className="text-sm font-medium">Beds</span>
        </div>
      </div>

      {currentStep === 1 && renderDormitoryForm()}
      {currentStep === 2 && renderBedsForm()}
    </div>
  );
}
