'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  fetchBookingSources,
  createBookingSource,
  updateBookingSource,
  deleteBookingSource,
  toggleBookingSourceStatus,
} from '@/store/slices/bookingSourceSlice';
import { fetchBookingTypes } from '@/store/slices/bookingTypeSlice';
import { useNotification } from '@/hooks/useNotification';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';

// Shared components
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

// Feature components
import { BookingSourceStatsCards } from '@/components/features/booking-sources/BookingSourceStatsCards';
import { BookingSourceTableRow } from '@/components/features/booking-sources/BookingSourceTableRow';
import { BookingSourceForm } from '@/components/features/booking-sources/BookingSourceForm';
import { BookingSourceDetailsDialog } from '@/components/features/booking-sources/BookingSourceDetailsDialog';
import { CommissionCalculator } from '@/components/features/booking-sources/CommissionCalculator';

import type {
  BookingSource,
  CreateBookingSourceData,
  UpdateBookingSourceData,
} from '@/services/booking.service';

export default function BookingSourcesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { success, error } = useNotification();

  const { bookingSources, loading, pagination } = useSelector(
    (state: RootState) => state.bookingSource,
  );

  const { bookingTypes } = useSelector((state: RootState) => state.bookingType);

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bookingTypeFilter, setBookingTypeFilter] = useState<string>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [selectedBookingSource, setSelectedBookingSource] =
    useState<BookingSource | null>(null);

  // Load data
  useEffect(() => {
    dispatch(fetchBookingSources({ page: 1, limit: 100 }));
    dispatch(fetchBookingTypes({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Filtered data
  const filteredBookingSources = bookingSources.filter((bs) => {
    const matchesSearch =
      !searchTerm || bs.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && bs.isActive) ||
      (statusFilter === 'inactive' && !bs.isActive);

    const matchesType =
      bookingTypeFilter === 'all' || bs.bookingTypeId === bookingTypeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate stats
  const stats = {
    total: bookingSources.length,
    active: bookingSources.filter((bs) => bs.isActive).length,
    inactive: bookingSources.filter((bs) => !bs.isActive).length,
    averageCommission:
      bookingSources.length > 0
        ? bookingSources.reduce((sum, bs) => sum + bs.commissionRate, 0) /
          bookingSources.length
        : 0,
  };

  // Handlers
  const handleCreate = async (data: CreateBookingSourceData) => {
    try {
      await dispatch(createBookingSource(data)).unwrap();
      success('Booking source created successfully');
      setCreateOpen(false);
      dispatch(fetchBookingSources({ page: 1, limit: 100 }));
    } catch (err) {
      error('Failed to create booking source');
      console.error(err);
    }
  };

  const handleEdit = async (data: UpdateBookingSourceData) => {
    if (!selectedBookingSource) return;

    try {
      await dispatch(
        updateBookingSource({ id: selectedBookingSource.id, data }),
      ).unwrap();
      success('Booking source updated successfully');
      setEditOpen(false);
      setSelectedBookingSource(null);
      dispatch(fetchBookingSources({ page: 1, limit: 100 }));
    } catch (err) {
      error('Failed to update booking source');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!selectedBookingSource) return;

    try {
      await dispatch(deleteBookingSource(selectedBookingSource.id)).unwrap();
      success('Booking source deleted successfully');
      setDeleteOpen(false);
      setSelectedBookingSource(null);
      dispatch(fetchBookingSources({ page: 1, limit: 100 }));
    } catch (err) {
      error('Failed to delete booking source');
      console.error(err);
    }
  };

  const handleToggleStatus = async (bookingSource: BookingSource) => {
    try {
      await dispatch(
        toggleBookingSourceStatus({
          id: bookingSource.id,
          activate: !bookingSource.isActive,
        }),
      ).unwrap();
      success(
        `Booking source ${bookingSource.isActive ? 'deactivated' : 'activated'} successfully`,
      );
      dispatch(fetchBookingSources({ page: 1, limit: 100 }));
    } catch (err) {
      error('Failed to toggle booking source status');
      console.error(err);
    }
  };

  const handleViewBookingSource = (bookingSource: BookingSource) => {
    setSelectedBookingSource(bookingSource);
    setViewOpen(true);
  };

  const handleEditBookingSource = (bookingSource: BookingSource) => {
    setSelectedBookingSource(bookingSource);
    setEditOpen(true);
  };

  const handleDeleteBookingSource = (bookingSource: BookingSource) => {
    setSelectedBookingSource(bookingSource);
    setDeleteOpen(true);
  };

  const handleCalculateCommission = (bookingSource: BookingSource) => {
    setSelectedBookingSource(bookingSource);
    setCalculatorOpen(true);
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'bookingType', label: 'Booking Type' },
    { key: 'commission', label: 'Commission' },
    { key: 'status', label: 'Status' },
    { key: 'created', label: 'Created' },
    { key: 'actions', label: 'Actions' },
  ];

  const renderBookingSourceRow = (bookingSource: BookingSource) => (
    <BookingSourceTableRow
      key={bookingSource.id}
      bookingSource={bookingSource}
      onView={handleViewBookingSource}
      onEdit={handleEditBookingSource}
      onDelete={handleDeleteBookingSource}
      onToggleStatus={handleToggleStatus}
      onCalculateCommission={handleCalculateCommission}
    />
  );

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Booking Sources"
        description="Manage booking sources and commission rates"
      >
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Booking Source
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <BookingSourceStatsCards stats={stats} />

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SearchBar
              placeholder="Search by name..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
            <Select
              value={bookingTypeFilter}
              onValueChange={setBookingTypeFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by booking type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Booking Types</SelectItem>
                {bookingTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Booking Sources Table */}
      <DataTable
        title="Booking Sources"
        columns={columns}
        data={filteredBookingSources}
        loading={loading}
        renderRow={renderBookingSourceRow}
      />

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Booking Source</DialogTitle>
          </DialogHeader>
          <BookingSourceForm
            mode="create"
            onSubmit={handleCreate}
            onCancel={() => setCreateOpen(false)}
            loading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Booking Source</DialogTitle>
          </DialogHeader>
          <BookingSourceForm
            mode="edit"
            bookingSource={selectedBookingSource || undefined}
            onSubmit={handleEdit}
            onCancel={() => setEditOpen(false)}
            loading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <BookingSourceDetailsDialog
        bookingSource={selectedBookingSource}
        open={viewOpen}
        onOpenChange={setViewOpen}
      />

      {/* Commission Calculator */}
      <CommissionCalculator
        bookingSource={selectedBookingSource}
        open={calculatorOpen}
        onOpenChange={setCalculatorOpen}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Booking Source"
        description={`Are you sure you want to delete "${selectedBookingSource?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
