'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { updateFilters } from '@/store/slices/reportSlice';
import { fetchProperties } from '@/store/slices/propertySlice';
import { fetchRoomTypes } from '@/store/slices/roomTypeSlice';
import { fetchDormitories } from '@/store/slices/dormitorySlice';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Calendar, Filter, X } from 'lucide-react';

interface ReportFiltersProps {
  onGenerate: () => void;
  loading: boolean;
}

export function ReportFilters({ onGenerate, loading }: ReportFiltersProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { properties } = useSelector((state: RootState) => state.property);
  const { roomTypes } = useSelector((state: RootState) => state.roomType);
  const { dormitories } = useSelector((state: RootState) => state.dormitory);
  const { filters } = useSelector((state: RootState) => state.reports);

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: string, value: any) => {
    dispatch(updateFilters({ [key]: value }));
  };

  const handleGenerate = () => {
    onGenerate();
  };

  const clearFilters = () => {
    dispatch(updateFilters({
      propertyId: undefined,
      roomTypeId: undefined,
      dormitoryId: undefined,
      paymentMethod: undefined,
      guestId: undefined,
    }));
  };

  return (
    <Card className="bg-card border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Property</Label>
            <Select
              value={filters.propertyId || 'all'}
              onValueChange={(value) => handleFilterChange('propertyId', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>End Date</Label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Group By</Label>
            <Select
              value={filters.groupBy}
              onValueChange={(value) => handleFilterChange('groupBy', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label>Room Type</Label>
              <Select
                value={filters.roomTypeId || 'all'}
                onValueChange={(value) => handleFilterChange('roomTypeId', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All room types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Room Types</SelectItem>
                  {roomTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dormitory</Label>
              <Select
                value={filters.dormitoryId || 'all'}
                onValueChange={(value) => handleFilterChange('dormitoryId', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All dormitories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dormitories</SelectItem>
                  {dormitories.map((dormitory) => (
                    <SelectItem key={dormitory.id} value={dormitory.id}>
                      {dormitory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select
                value={filters.paymentMethod || 'all'}
                onValueChange={(value) => handleFilterChange('paymentMethod', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Guest ID</Label>
              <Input
                placeholder="Enter guest ID"
                value={filters.guestId || ''}
                onChange={(e) => handleFilterChange('guestId', e.target.value || undefined)}
              />
            </div>
          </div>
        )}

        {/* Options */}
        <div className="flex items-center space-x-4 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeCharts"
              checked={filters.includeCharts}
              onCheckedChange={(checked) => handleFilterChange('includeCharts', checked)}
            />
            <Label htmlFor="includeCharts">Include Charts</Label>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleGenerate} disabled={loading} className="min-w-[120px]">
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

