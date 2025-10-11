'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchProperties } from '@/store/slices/propertySlice';
import { dormitoryService } from '@/services/dormitory.service';
import { DailyDormitoryOccupancy } from '@/types/dormitory.types';
import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Building } from 'lucide-react';

import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DormitoryOccupancyCalendarGrid } from '@/components/features/dormitories/DormitoryOccupancyCalendarGrid';
import { DormitoryOccupancyDetailsDialog } from '@/components/features/dormitories/DormitoryOccupancyDetailsDialog';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';

export default function DormitoryOccupancyCalendarPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { properties, loading: propertiesLoading } = useSelector(
    (state: RootState) => state.property,
  );

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [occupancyData, setOccupancyData] = useState<DailyDormitoryOccupancy[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedOccupancyData, setSelectedOccupancyData] =
    useState<DailyDormitoryOccupancy | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Load properties on component mount
  useEffect(() => {
    dispatch(fetchProperties({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Set default property when properties are loaded
  useEffect(() => {
    if (properties && properties.length > 0 && !selectedPropertyId) {
      setSelectedPropertyId(properties[0].id);
    }
  }, [properties, selectedPropertyId]);

  const fetchOccupancyData = useCallback(async () => {
    if (!selectedPropertyId) return;

    setLoading(true);
    setError(null);

    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const response = await dormitoryService.getOccupancyCalendar({
        propertyId: selectedPropertyId,
        year,
        month,
      });

      if (response.data.success) {
        setOccupancyData(response.data.data || []);
      } else {
        setError(
          response.data.error?.message || 'Failed to fetch occupancy data',
        );
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedPropertyId, currentDate]);

  // Fetch data when property or date changes
  useEffect(() => {
    fetchOccupancyData();
  }, [fetchOccupancyData]);

  const handlePropertyChange = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
  };

  const handlePreviousMonth = () => {
    setCurrentDate((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => addMonths(prev, 1));
  };

  const handleCellClick = (
    data: DailyDormitoryOccupancy | null,
    date: Date,
  ) => {
    setSelectedDate(date);
    setSelectedOccupancyData(data);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedDate(null);
    setSelectedOccupancyData(null);
  };

  if (propertiesLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <EmptyState
        icon={Building}
        title="Error Loading Data"
        description={error}
        action={{
          label: 'Try Again',
          onClick: fetchOccupancyData,
        }}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Dormitory Occupancy Calendar"
        description="View dormitory occupancy rates and bed availability"
      />

      {/* Filters Card */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-card border rounded-lg p-4">
        <div className="flex items-center gap-2 flex-1">
          <Building className="h-4 w-4 text-muted-foreground" />
          <Select
            value={selectedPropertyId}
            onValueChange={handlePropertyChange}
          >
            <SelectTrigger className="w-full sm:w-[280px]">
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousMonth}
            disabled={loading}
            className="h-9 w-9 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled
            className="min-w-[140px] font-medium"
          >
            <Calendar className="h-4 w-4 mr-2" />
            {format(currentDate, 'MMM yyyy')}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            disabled={loading}
            className="h-9 w-9 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Card */}
      {loading ? (
        <LoadingState />
      ) : (
        <DormitoryOccupancyCalendarGrid
          data={occupancyData}
          year={currentDate.getFullYear()}
          month={currentDate.getMonth() + 1}
          onCellClick={handleCellClick}
        />
      )}

      {/* Details Dialog */}
      <DormitoryOccupancyDetailsDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        data={selectedOccupancyData}
        date={selectedDate || new Date()}
      />
    </div>
  );
}
