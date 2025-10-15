'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  fetchRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  updateSearchCache,
  setLastSearchTerm,
} from '@/store/slices/roomSlice';
import { Button } from '@/components/ui/button';
import { openModal } from '@/store/slices/uiSlice';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// removed duplicate import
import { Plus, Filter } from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';
import { handleApiError } from '@/lib/api/error-handler';
import type { AxiosError } from 'axios';
import type { Room } from '@/types';

// Import extracted components
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchBar } from '@/components/shared/SearchBar';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { RoomStatsCards } from '@/components/features/rooms/RoomStatsCards';
import { RoomTableRow } from '@/components/features/rooms/RoomTableRow';
import { RoomForm } from '@/components/features/rooms/RoomForm';
import RoomViewDialog from '../../../../../components/features/rooms/RoomViewDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function RoomsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    rooms,
    loading,
    pagination,
    searchCache,
    lastSearchTerm,
    isSearching,
  } = useSelector((state: RootState) => state.room);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Separate state for stats that don't change during search
  const [statsData, setStatsData] = useState({
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    maintenanceRooms: 0,
  });

  const { success, error } = useNotification();

  // Normalize error messages whether coming from unwrap(rejectWithValue) or Axios
  const getErrorMessage = (err: unknown) => {
    if (typeof err === 'string') return err;
    const apiErr = handleApiError(err as AxiosError);
    return apiErr.message || 'An unexpected error occurred';
  };

  // Fetch overall stats data (not affected by search)
  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        const response = await dispatch(
          fetchRooms({
            page: 1,
            limit: 1000, // Get all rooms for stats calculation
            search: undefined,
            status: undefined,
            propertyId: undefined,
          }),
        ).unwrap();

        const allRooms = response.data || [];

        setStatsData({
          totalRooms: allRooms.length,
          availableRooms: allRooms.filter((r) => r.status === 'AVAILABLE')
            .length,
          occupiedRooms: allRooms.filter((r) => r.status === 'OCCUPIED').length,
          maintenanceRooms: allRooms.filter((r) => r.status === 'MAINTENANCE')
            .length,
        });
      } catch (e) {
        console.error('Failed to fetch stats data:', e);
      }
    };

    fetchStatsData();
  }, [dispatch]);

  // Optimistic search - show cached results immediately
  useEffect(() => {
    if (searchTerm.trim() && searchCache[searchTerm]) {
      dispatch(
        updateSearchCache({
          term: searchTerm,
          results: searchCache[searchTerm],
        }),
      );
      dispatch(setLastSearchTerm(searchTerm));
    }
  }, [searchTerm, searchCache, dispatch]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch with pagination
  useEffect(() => {
    dispatch(
      fetchRooms({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        propertyId: propertyFilter === 'all' ? undefined : propertyFilter,
      }),
    );
  }, [dispatch, debouncedSearch, statusFilter, propertyFilter, page, limit]);

  const handleCreateRoom = async (data: any) => {
    try {
      await dispatch(createRoom(data)).unwrap();
      success('Room created');
      setOpenCreate(false);
      // refetch with current search term
      dispatch(
        fetchRooms({
          page: 1,
          limit: 10,
          search: debouncedSearch || undefined,
          status: statusFilter === 'all' ? undefined : statusFilter,
          propertyId: propertyFilter === 'all' ? undefined : propertyFilter,
        }),
      );
    } catch (e) {
      error(getErrorMessage(e));
    }
  };

  const handleEditRoom = async (data: any) => {
    if (!selectedRoom) return;
    try {
      // Map form fields to API payload
      const updatePayload = {
        number: data.number,
        floor: data.floor,
        status: data.status,
        isActive: data.isActive,
        propertyId: data.propertyId,
        roomTypeId: data.typeId,
      };

      await dispatch(
        updateRoom({ id: selectedRoom.id, data: updatePayload }),
      ).unwrap();
      success('Room updated');
      setOpenEdit(false);
      setSelectedRoom(null);
      // refetch with current search term
      dispatch(
        fetchRooms({
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearch || undefined,
          status: statusFilter === 'all' ? undefined : statusFilter,
          propertyId: propertyFilter === 'all' ? undefined : propertyFilter,
        }),
      );
    } catch (e) {
      error(getErrorMessage(e));
    }
  };

  const handleDeleteRoom = async () => {
    if (!selectedRoom) return;
    try {
      await dispatch(deleteRoom(selectedRoom.id)).unwrap();
      success('Room deleted');
      setOpenDelete(false);
      setSelectedRoom(null);
      // refetch with current search term
      dispatch(
        fetchRooms({
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearch || undefined,
          status: statusFilter === 'all' ? undefined : statusFilter,
          propertyId: propertyFilter === 'all' ? undefined : propertyFilter,
        }),
      );
    } catch (e) {
      error(getErrorMessage(e));
    }
  };

  const columns = [
    { key: 'room', label: 'Room', width: 'w-[200px]' },
    { key: 'capacity', label: 'Capacity', width: 'w-[120px]' },
    { key: 'price', label: 'Price', width: 'w-[120px]' },
    { key: 'status', label: 'Status', width: 'w-[120px]' },
    { key: 'amenities', label: 'Amenities', width: 'w-[200px]' },
    { key: 'actions', label: 'Actions', width: 'w-[120px]', sortable: false },
  ];

  const renderRoomRow = (room: Room) => (
    <RoomTableRow
      key={room.id}
      room={room}
      onView={(r) => {
        setSelectedRoom(r);
        setOpenView(true);
      }}
      onEdit={(r) => {
        setSelectedRoom(r);
        setOpenEdit(true);
      }}
      onDelete={(r) => {
        setSelectedRoom(r);
        setOpenDelete(true);
      }}
    />
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Rooms"
        description="Manage hotel rooms and availability"
      >
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
          onClick={() => dispatch(openModal('addRoom'))}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Room
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <RoomStatsCards stats={statsData} />

      {/* Data Table with integrated search and filters */}
      <DataTable
        title="Rooms"
        description="Manage and view all rooms"
        columns={columns}
        data={rooms || []}
        loading={loading}
        emptyMessage="No rooms found"
        searchBar={
          <SearchBar
            placeholder="Search by room number or type..."
            value={searchTerm}
            onChange={setSearchTerm}
            loading={isSearching}
          />
        }
        filters={
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="OCCUPIED">Occupied</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                <SelectItem value="OUT_OF_ORDER">Out of Order</SelectItem>
              </SelectContent>
            </Select>
            <Select value={propertyFilter} onValueChange={setPropertyFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {/* This would be populated from properties state */}
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        }
        renderRow={renderRoomRow}
        pagination={{
          page,
          limit,
          total: pagination?.total,
          totalPages: pagination?.totalPages,
          onPageChange: (p) => setPage(Math.max(1, p)),
          onLimitChange: (l) => {
            setLimit(l);
            setPage(1);
          },
        }}
      />

      {/* View Room Dialog */}
      <RoomViewDialog
        open={openView}
        room={selectedRoom}
        onOpenChange={(open: boolean) => {
          setOpenView(open);
          if (!open) setSelectedRoom(null);
        }}
      />

      {/* Edit Room Dialog */}
      <Dialog
        open={openEdit}
        onOpenChange={(open) => {
          setOpenEdit(open);
          if (!open) setSelectedRoom(null);
        }}
      >
        <DialogContent className="!w-[90vw] !max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
          </DialogHeader>
          {selectedRoom && (
            <RoomForm
              key={selectedRoom.id}
              room={selectedRoom}
              onSubmit={handleEditRoom}
              onCancel={() => setOpenEdit(false)}
              loading={loading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={openDelete}
        onOpenChange={(open) => {
          setOpenDelete(open);
          if (!open) setSelectedRoom(null);
        }}
        title="Delete Room"
        description={`Are you sure you want to delete ${
          selectedRoom ? `room ${selectedRoom.number}` : 'this room'
        }? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDeleteRoom}
        loading={loading}
      />
    </div>
  );
}
