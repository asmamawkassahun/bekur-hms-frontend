'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  fetchBookingTypes,
  createBookingType,
  updateBookingType,
  deleteBookingType,
  toggleBookingTypeStatus,
} from '@/store/slices/bookingTypeSlice';
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
import { BookingTypeStatsCards } from '@/components/features/booking-types/BookingTypeStatsCards';
import { BookingTypeTableRow } from '@/components/features/booking-types/BookingTypeTableRow';
import { BookingTypeForm } from '@/components/features/booking-types/BookingTypeForm';
import { BookingTypeDetailsDialog } from '@/components/features/booking-types/BookingTypeDetailsDialog';

import type {
  BookingType,
  CreateBookingTypeData,
  UpdateBookingTypeData,
} from '@/services/booking.service';

export default function BookingTypesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { success, error } = useNotification();

  const { bookingTypes, loading, pagination } = useSelector(
    (state: RootState) => state.bookingType,
  );

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedBookingType, setSelectedBookingType] =
    useState<BookingType | null>(null);

  // Load data
  useEffect(() => {
    dispatch(fetchBookingTypes({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Filtered data
  const filteredBookingTypes = bookingTypes.filter((bt) => {
    const matchesSearch =
      !searchTerm ||
      bt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bt.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && bt.isActive) ||
      (statusFilter === 'inactive' && !bt.isActive);

    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: bookingTypes.length,
    active: bookingTypes.filter((bt) => bt.isActive).length,
    inactive: bookingTypes.filter((bt) => !bt.isActive).length,
  };

  // Handlers
  const handleCreate = async (data: CreateBookingTypeData) => {
    try {
      await dispatch(createBookingType(data)).unwrap();
      success('Booking type created successfully');
      setCreateOpen(false);
      dispatch(fetchBookingTypes({ page: 1, limit: 100 }));
    } catch (err) {
      error('Failed to create booking type');
      console.error(err);
    }
  };

  const handleEdit = async (data: UpdateBookingTypeData) => {
    if (!selectedBookingType) return;

    try {
      await dispatch(
        updateBookingType({ id: selectedBookingType.id, data }),
      ).unwrap();
      success('Booking type updated successfully');
      setEditOpen(false);
      setSelectedBookingType(null);
      dispatch(fetchBookingTypes({ page: 1, limit: 100 }));
    } catch (err) {
      error('Failed to update booking type');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!selectedBookingType) return;

    try {
      await dispatch(deleteBookingType(selectedBookingType.id)).unwrap();
      success('Booking type deleted successfully');
      setDeleteOpen(false);
      setSelectedBookingType(null);
      dispatch(fetchBookingTypes({ page: 1, limit: 100 }));
    } catch (err) {
      error('Failed to delete booking type');
      console.error(err);
    }
  };

  const handleToggleStatus = async (bookingType: BookingType) => {
    try {
      await dispatch(
        toggleBookingTypeStatus({
          id: bookingType.id,
          activate: !bookingType.isActive,
        }),
      ).unwrap();
      success(
        `Booking type ${bookingType.isActive ? 'deactivated' : 'activated'} successfully`,
      );
      dispatch(fetchBookingTypes({ page: 1, limit: 100 }));
    } catch (err) {
      error('Failed to toggle booking type status');
      console.error(err);
    }
  };

  const handleViewBookingType = (bookingType: BookingType) => {
    setSelectedBookingType(bookingType);
    setViewOpen(true);
  };

  const handleEditBookingType = (bookingType: BookingType) => {
    setSelectedBookingType(bookingType);
    setEditOpen(true);
  };

  const handleDeleteBookingType = (bookingType: BookingType) => {
    setSelectedBookingType(bookingType);
    setDeleteOpen(true);
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' },
    { key: 'created', label: 'Created' },
    { key: 'actions', label: 'Actions' },
  ];

  const renderBookingTypeRow = (bookingType: BookingType) => (
    <BookingTypeTableRow
      key={bookingType.id}
      bookingType={bookingType}
      onView={handleViewBookingType}
      onEdit={handleEditBookingType}
      onDelete={handleDeleteBookingType}
      onToggleStatus={handleToggleStatus}
    />
  );

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Booking Types"
        description="Manage booking types for reservations"
      >
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Booking Type
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <BookingTypeStatsCards stats={stats} />

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchBar
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
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

      {/* Booking Types Table */}
      <DataTable
        title="Booking Types"
        columns={columns}
        data={filteredBookingTypes}
        loading={loading}
        renderRow={renderBookingTypeRow}
      />

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Booking Type</DialogTitle>
          </DialogHeader>
          <BookingTypeForm
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
            <DialogTitle>Edit Booking Type</DialogTitle>
          </DialogHeader>
          <BookingTypeForm
            mode="edit"
            bookingType={selectedBookingType || undefined}
            onSubmit={handleEdit}
            onCancel={() => setEditOpen(false)}
            loading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <BookingTypeDetailsDialog
        bookingType={selectedBookingType}
        open={viewOpen}
        onOpenChange={setViewOpen}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Booking Type"
        description={`Are you sure you want to delete "${selectedBookingType?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
