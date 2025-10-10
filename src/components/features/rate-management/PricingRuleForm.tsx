"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type {
  CreatePricingRuleData,
  PricingRule,
  PricingRuleType,
} from '@/types';
import type { Property } from '@/types';
import { propertyService } from '@/services/property.service';

type Props = {
  onSubmit: (data: CreatePricingRuleData | Partial<PricingRule>) => void;
  onCancel: () => void;
  loading?: boolean;
  rule?: PricingRule;
};

const RULE_TYPES: PricingRuleType[] = [
  'OCCUPANCY_BASED',
  'SEASONAL',
  'DAY_OF_WEEK',
  'PROMOTIONAL',
  'EARLY_BIRD',
  'LAST_MINUTE',
  'PACKAGE',
];

export function PricingRuleForm({ onSubmit, onCancel, loading, rule }: Props) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [useCustomName, setUseCustomName] = useState(false);

  const form = useForm<CreatePricingRuleData | Partial<PricingRule>>({
    defaultValues: rule
      ? {
          name: rule.name,
          description: rule.description,
          propertyId: rule.propertyId,
          type: rule.type,
          config: rule.config,
          startDate: rule.startDate?.slice(0, 16),
          endDate: rule.endDate ? rule.endDate.slice(0, 16) : undefined,
          priority: rule.priority,
          isActive: rule.isActive,
        }
      : {
          name: '',
          description: '',
          propertyId: '',
          type: 'SEASONAL',
          config: { multiplier: 1.0 },
          startDate: '',
          endDate: '',
          priority: 0,
          isActive: true,
        },
  });

  const selectedType = form.watch('type') as PricingRuleType;
  const selectedProperty = form.watch('propertyId') as string;
  const currentName = form.watch('name') as string;

  useEffect(() => {
    const fetchProps = async () => {
      try {
        setLoadingProperties(true);
        const res = await propertyService.getAll({ page: 1, limit: 1000 });
        const items = Array.isArray(res.data?.data)
          ? (res.data?.data as Property[])
          : ((res.data?.data as any)?.items || []);
        setProperties(items);
      } catch (e) {
        console.error('Failed to load properties', e);
      } finally {
        setLoadingProperties(false);
      }
    };
    fetchProps();
  }, []);

  useEffect(() => {
    if (selectedType === 'OCCUPANCY_BASED') {
      const config = form.getValues('config') as any;
      const thresholds = config?.thresholds || [
        { min: 0, max: 50, modifier: -10 },
        { min: 51, max: 70, modifier: 0 },
        { min: 71, max: 90, modifier: 15 },
        { min: 91, max: 100, modifier: 25 },
      ];
      form.setValue('config', {
        propertyId: selectedProperty,
        thresholds,
      } as any);
    }
  }, [selectedType, selectedProperty, form]);

  // Ensure DAY_OF_WEEK config has a complete days object to avoid undefined inputs
  useEffect(() => {
    if (selectedType === 'DAY_OF_WEEK') {
      const cfg = (form.getValues('config') as any) || {};
      const days = cfg.days || {};
      let changed = false;
      for (let i = 0; i < 7; i++) {
        if (!days[i]) {
          days[i] = { multiplier: 1 };
          changed = true;
        }
      }
      if (!cfg.days || changed) {
        form.setValue('config', { ...cfg, days } as any, { shouldDirty: false });
      }
    }
  }, [selectedType, form]);

  const nameOptionsByType: Record<PricingRuleType, { value: string; label: string }[]> = {
    SEASONAL: [
      { value: 'Peak Season', label: 'Peak Season' },
      { value: 'Holiday Season', label: 'Holiday Season' },
      { value: 'Off Season', label: 'Off Season' },
    ],
    DAY_OF_WEEK: [
      { value: 'Weekend Uplift', label: 'Weekend Uplift' },
      { value: 'Weekday Discount', label: 'Weekday Discount' },
    ],
    PROMOTIONAL: [
      { value: 'Black Friday', label: 'Black Friday' },
      { value: 'Cyber Monday', label: 'Cyber Monday' },
      { value: 'New Year Promo', label: 'New Year Promo' },
    ],
    EARLY_BIRD: [
      { value: 'Early Bird', label: 'Early Bird' },
    ],
    LAST_MINUTE: [
      { value: 'Last Minute Deal', label: 'Last Minute Deal' },
    ],
    PACKAGE: [
      { value: 'Stay 3+ Nights', label: 'Stay 3+ Nights' },
      { value: 'Weekly Stay', label: 'Weekly Stay' },
    ],
    OCCUPANCY_BASED: [
      { value: 'Occupancy Driven', label: 'Occupancy Driven' },
    ],
  };

  const handleSubmit = (values: any) => {
    const normalize = (v?: string) => (v && v.length <= 16 ? new Date(v).toISOString() : v);
    const payload = {
      ...values,
      startDate: normalize(values.startDate),
      endDate: normalize(values.endDate),
    };
    onSubmit(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                {useCustomName ? (
                  <FormControl>
                    <Input placeholder="Custom rule name" {...field} />
                  </FormControl>
                ) : (
                  <Select
                    value={field.value as string}
                    onValueChange={(v) => field.onChange(v)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a rule name" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(nameOptionsByType[selectedType] || []).map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <Checkbox id="custom-name" checked={useCustomName} onCheckedChange={(v) => setUseCustomName(Boolean(v))} />
                  <label htmlFor="custom-name" className="text-sm text-muted-foreground cursor-pointer">Use custom name</label>
                </div>
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
                <Select
                  value={field.value as string}
                  onValueChange={(v) => field.onChange(v)}
                  disabled={loadingProperties}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingProperties ? 'Loading properties...' : 'Select property'} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Select an existing property by name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rule Type</FormLabel>
                <Select value={field.value as string} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {RULE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t.replaceAll('_', ' ')}
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
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <FormControl>
                  <Input type="number" value={(field.value as number | string | undefined) ?? ''} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="datetime-local" value={field.value ?? ''} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="datetime-local" value={field.value ?? ''} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} />
                </FormControl>
                <FormDescription>Leave empty for no end date.</FormDescription>
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
                <Textarea rows={3} placeholder="Description (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Active toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Active</FormLabel>
                <div className="flex items-center gap-2 pt-2">
                  <Checkbox
                    id="is-active"
                    checked={Boolean(field.value)}
                    onCheckedChange={(v) => field.onChange(Boolean(v))}
                  />
                  <label htmlFor="is-active" className="text-sm text-muted-foreground cursor-pointer">
                    Enable this rule
                  </label>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {selectedType === 'SEASONAL' && (
          <FormField
            control={form.control}
            name={"config.multiplier" as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Multiplier</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" value={(field.value as number | string | undefined) ?? ''} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} />
                </FormControl>
                <FormDescription>e.g., 1.5 for +50%.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {selectedType === 'DAY_OF_WEEK' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <FormField
                key={i}
                control={form.control}
                name={`config.days.${i}.multiplier` as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day {i}</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.1" value={(field.value as number | string | undefined) ?? ''} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        )}

        {selectedType === 'OCCUPANCY_BASED' && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">Thresholds (min-max, % modifier)</div>
            {[0, 1, 2, 3].map((idx) => (
              <div key={idx} className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name={`config.thresholds.${idx}.min` as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min</FormLabel>
                      <FormControl>
                        <Input type="number" value={(field.value as number | string | undefined) ?? ''} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`config.thresholds.${idx}.max` as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max</FormLabel>
                      <FormControl>
                        <Input type="number" value={(field.value as number | string | undefined) ?? ''} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`config.thresholds.${idx}.modifier` as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modifier %</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" value={(field.value as number | string | undefined) ?? ''} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>
        )}

        {['PROMOTIONAL', 'EARLY_BIRD', 'LAST_MINUTE', 'PACKAGE'].includes(
          selectedType,
        ) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedType === 'EARLY_BIRD' && (
              <FormField
                control={form.control}
                name={`config.minDays` as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Days</FormLabel>
                    <FormControl>
                      <Input type="number" value={(field.value as number | string | undefined) ?? ''} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {selectedType === 'LAST_MINUTE' && (
              <FormField
                control={form.control}
                name={`config.maxDays` as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Days</FormLabel>
                    <FormControl>
                      <Input type="number" value={(field.value as number | string | undefined) ?? ''} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {selectedType === 'PACKAGE' && (
              <FormField
                control={form.control}
                name={`config.minNights` as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Nights</FormLabel>
                    <FormControl>
                      <Input type="number" value={(field.value as number | string | undefined) ?? ''} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name={`config.discountPercent` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount %</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" value={(field.value as number | string | undefined) ?? ''} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} className="cursor-pointer">
            Cancel
          </Button>
          <Button type="submit" className="cursor-pointer" disabled={loading}>
            {rule ? 'Save Changes' : 'Create Rule'}
          </Button>
        </div>
      </form>
    </Form>
  );
}


