'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchProperties } from '@/store/slices/propertySlice';
import { roomService } from '@/services/room.service';
import { DailyOccupancy } from '@/types/room.types';
import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Building } from 'lucide-react';

import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OccupancyCalendarGrid } from '@/components/features/rooms/OccupancyCalendarGrid';
import { OccupancyDetailsDialog } from '@/components/features/rooms/OccupancyDetailsDialog';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';

export default function OccupancyCalendarPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { properties, loading: propertiesLoading } = useSelector((state: RootState) => state.property);

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [occupancyData, setOccupancyData] = useState<DailyOccupancy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedOccupancyData, setSelectedOccupancyData] = useState<DailyOccupancy | null>(null);
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
      const response = await roomService.getOccupancyCalendar({
        propertyId: selectedPropertyId,
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1,
      });

      setOccupancyData(response.data.data || []);
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err && 
        err.response && typeof err.response === 'object' && 'data' in err.response &&
        err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data
        ? String(err.response.data.message)
        : 'Failed to fetch occupancy data';
      setError(errorMessage);
      setOccupancyData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedPropertyId, currentDate]);

  // Fetch occupancy data when property or date changes
  useEffect(() => {
    if (selectedPropertyId) {
      fetchOccupancyData();
    }
  }, [selectedPropertyId, fetchOccupancyData]);

  const handlePreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const handleCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  const handleCellClick = (data: DailyOccupancy | null, date: Date) => {
    setSelectedDate(date);
    setSelectedOccupancyData(data);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedDate(null);
    setSelectedOccupancyData(null);
  };

  const selectedProperty = properties?.find(p => p.id === selectedPropertyId);

  if (propertiesLoading) {
    return (
      <div className="p-6">
        <PageHeader
          title="Room Occupancy Calendar"
          description="View daily room occupancy rates for your properties"
        />
        <LoadingState rows={8} columns={7} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Room Occupancy Calendar"
        description="View daily room occupancy rates for your properties"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-gray-500" />
            <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {properties?.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleCurrentMonth}
            className="min-w-[120px]"
          >
            {format(currentDate, 'MMM yyyy')}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar */}
      {error ? (
        <EmptyState
          title="Error Loading Data"
          description={error}
          icon={Calendar}
        />
      ) : loading ? (
        <LoadingState rows={6} columns={7} />
      ) : !selectedProperty ? (
        <EmptyState
          title="No Property Selected"
          description="Please select a property to view occupancy data"
          icon={Building}
        />
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Showing occupancy data for <span className="font-medium">{selectedProperty.name}</span> in {format(currentDate, 'MMMM yyyy')}
          </div>
          
          <OccupancyCalendarGrid
            data={occupancyData}
            year={currentDate.getFullYear()}
            month={currentDate.getMonth() + 1}
            onCellClick={handleCellClick}
          />
        </div>
      )}

      {/* Details Dialog */}
      {selectedDate && (
        <OccupancyDetailsDialog
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          data={selectedOccupancyData}
          date={selectedDate}
        />
      )}
    </div>
  );
}
