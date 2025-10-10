import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, BedDouble } from 'lucide-react';
import type { BedType } from '@/types';

interface BedConfiguration {
  bedTypeId: string;
  quantity: number;
}

interface BedConfigurationSectionProps {
  beds: BedConfiguration[];
  bedTypes: BedType[];
  onChange: (beds: BedConfiguration[]) => void;
}

export function BedConfigurationSection({
  beds,
  bedTypes,
  onChange,
}: BedConfigurationSectionProps) {
  const addBed = () => {
    onChange([
      ...beds,
      {
        bedTypeId: bedTypes[0]?.id || '',
        quantity: 1,
      },
    ]);
  };

  const removeBed = (index: number) => {
    const newBeds = beds.filter((_, i) => i !== index);
    onChange(newBeds);
  };

  const updateBed = (
    index: number,
    field: keyof BedConfiguration,
    value: string | number,
  ) => {
    const newBeds = [...beds];
    newBeds[index] = { ...newBeds[index], [field]: value };
    onChange(newBeds);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BedDouble className="h-5 w-5" />
          Bed Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {beds.map((bed, index) => (
          <div
            key={index}
            className="flex items-end gap-4 p-4 border rounded-lg"
          >
            <div className="flex-1">
              <Label htmlFor={`bedType-${index}`}>Bed Type</Label>
              <Select
                value={bed.bedTypeId}
                onValueChange={(value) => updateBed(index, 'bedTypeId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bed type" />
                </SelectTrigger>
                <SelectContent>
                  {bedTypes.map((bedType) => (
                    <SelectItem key={bedType.id} value={bedType.id}>
                      {bedType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-24">
              <Label htmlFor={`quantity-${index}`}>Quantity</Label>
              <Input
                id={`quantity-${index}`}
                type="number"
                min="1"
                value={bed.quantity}
                onChange={(e) =>
                  updateBed(index, 'quantity', parseInt(e.target.value) || 1)
                }
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeBed(index)}
              className="min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={addBed}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Bed Type
        </Button>
      </CardContent>
    </Card>
  );
}
