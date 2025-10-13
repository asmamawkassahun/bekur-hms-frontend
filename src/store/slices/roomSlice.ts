import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { roomService } from '@/services/room.service';
import {
  Room,
  CreateRoomData,
  UpdateRoomData,
  UpdateRoomStatusData,
  BulkCreateRoomsData,
} from '@/types';

interface RoomState {
  rooms: Room[];
  currentRoom: Room | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  // Search optimization
  searchCache: Record<string, Room[]>;
  lastSearchTerm: string;
  isSearching: boolean;
  // Period-based availability
  availableRooms: Room[];
  availableRoomsLoading: boolean;
  availableRoomsError: string | null;
}

const initialState: RoomState = {
  rooms: [],
  currentRoom: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  // Search optimization
  searchCache: {},
  lastSearchTerm: '',
  isSearching: false,
  // Period-based availability
  availableRooms: [],
  availableRoomsLoading: false,
  availableRoomsError: null,
};

// Async thunks
export const fetchRooms = createAsyncThunk(
  'room/fetchRooms',
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      propertyId?: string;
      status?: string;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const response = await roomService.getAll(params);
      console.log('response from fetching rooms: ', response);
      return response.data;
    } catch (error: unknown) {
      const axiosErr = error as any;
      const responseData = axiosErr?.response?.data as any;
      const extractedMessage =
        responseData?.error?.message ||
        responseData?.message ||
        (Array.isArray(responseData?.errors) && responseData.errors[0]?.message);
      const errorMessage =
        extractedMessage ||
        (error instanceof Error ? error.message : 'Failed to fetch rooms');
      return rejectWithValue(errorMessage);
    }
  },
);

export const createRoom = createAsyncThunk(
  'room/createRoom',
  async (data: CreateRoomData, { rejectWithValue }) => {
    try {
      const response = await roomService.create(data);
      return response.data;
    } catch (error: unknown) {
      const axiosErr = error as any;
      const responseData = axiosErr?.response?.data as any;
      const extractedMessage =
        responseData?.error?.message ||
        responseData?.message ||
        (Array.isArray(responseData?.errors) && responseData.errors[0]?.message);
      const errorMessage =
        extractedMessage ||
        (error instanceof Error ? error.message : 'Failed to create room');
      return rejectWithValue(errorMessage);
    }
  },
);

export const updateRoom = createAsyncThunk(
  'room/updateRoom',
  async (
    { id, data }: { id: string; data: UpdateRoomData },
    { rejectWithValue },
  ) => {
    try {
      const response = await roomService.update(id, data);
      return response.data;
    } catch (error: unknown) {
      const axiosErr = error as any;
      const responseData = axiosErr?.response?.data as any;
      const extractedMessage =
        responseData?.error?.message ||
        responseData?.message ||
        (Array.isArray(responseData?.errors) && responseData.errors[0]?.message);
      const errorMessage =
        extractedMessage ||
        (error instanceof Error ? error.message : 'Failed to update room');
      return rejectWithValue(errorMessage);
    }
  },
);

export const updateRoomStatus = createAsyncThunk(
  'room/updateRoomStatus',
  async (
    { id, data }: { id: string; data: UpdateRoomStatusData },
    { rejectWithValue },
  ) => {
    try {
      const response = await roomService.updateStatus(id, data);
      return response.data;
    } catch (error: unknown) {
      const axiosErr = error as any;
      const responseData = axiosErr?.response?.data as any;
      const extractedMessage =
        responseData?.error?.message ||
        responseData?.message ||
        (Array.isArray(responseData?.errors) && responseData.errors[0]?.message);
      const errorMessage =
        extractedMessage ||
        (error instanceof Error ? error.message : 'Failed to update room status');
      return rejectWithValue(errorMessage);
    }
  },
);

export const deleteRoom = createAsyncThunk(
  'room/deleteRoom',
  async (id: string, { rejectWithValue }) => {
    try {
      await roomService.delete(id);
      return id;
    } catch (error: unknown) {
      const axiosErr = error as any;
      const responseData = axiosErr?.response?.data as any;
      const extractedMessage =
        responseData?.error?.message ||
        responseData?.message ||
        (Array.isArray(responseData?.errors) && responseData.errors[0]?.message);
      const errorMessage =
        extractedMessage ||
        (error instanceof Error ? error.message : 'Failed to delete room');
      return rejectWithValue(errorMessage);
    }
  },
);

export const bulkCreateRooms = createAsyncThunk(
  'room/bulkCreateRooms',
  async (data: BulkCreateRoomsData, { rejectWithValue }) => {
    try {
      const response = await roomService.bulkCreate(data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to bulk create rooms';
      return rejectWithValue(errorMessage);
    }
  },
);

// Fetch available rooms for a specific period
export const fetchAvailableRooms = createAsyncThunk(
  'room/fetchAvailableRooms',
  async (
    params: {
      propertyId: string;
      checkIn: string;
      checkOut: string;
      roomTypeId?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await roomService.getAvailable(params);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch available rooms';
      return rejectWithValue(errorMessage);
    }
  },
);

export const searchRooms = createAsyncThunk(
  'room/searchRooms',
  async (
    {
      query,
      params,
    }: { query: string; params?: { page?: number; limit?: number } },
    { rejectWithValue },
  ) => {
    try {
      const response = await roomService.search(query, params);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to search rooms';
      return rejectWithValue(errorMessage);
    }
  },
);

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setCurrentRoom: (state, action: PayloadAction<Room>) => {
      state.currentRoom = action.payload;
    },
    clearCurrentRoom: (state) => {
      state.currentRoom = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setPagination: (
      state,
      action: PayloadAction<{ page: number; limit: number }>,
    ) => {
      state.pagination.page = action.payload.page;
      state.pagination.limit = action.payload.limit;
    },
    // Optimistic search updates
    setSearching: (state, action: PayloadAction<boolean>) => {
      state.isSearching = action.payload;
    },
    updateSearchCache: (
      state,
      action: PayloadAction<{ term: string; results: Room[] }>,
    ) => {
      state.searchCache[action.payload.term] = action.payload.results;
    },
    setLastSearchTerm: (state, action: PayloadAction<string>) => {
      state.lastSearchTerm = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Rooms
      .addCase(fetchRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isSearching = true;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.isSearching = false;
        // Backend may return { success, data: Room[] } or { success, data: { rooms: Room[], total, page, limit } }
        const payloadData = action.payload?.data as unknown;
        let items: Room[] = [];
        let page: number | undefined;
        let limit: number | undefined;
        let total: number | undefined;
        let totalPages: number | undefined;

        if (Array.isArray(payloadData)) {
          items = payloadData as Room[];
        } else if (payloadData && typeof payloadData === 'object') {
          const dataObj = payloadData as {
            rooms?: Room[];
            items?: Room[];
            data?: Room[];
            total?: number;
            page?: number;
            limit?: number;
            totalPages?: number;
          };
          items = (dataObj.rooms ||
            dataObj.items ||
            dataObj.data ||
            []) as Room[];
          page = dataObj.page;
          limit = dataObj.limit;
          total = dataObj.total;
          totalPages = dataObj.totalPages;
        }

        state.rooms = items;

        // Cache search results for future use
        const searchTerm = action.meta.arg.search || '';
        if (searchTerm) {
          state.searchCache[searchTerm] = items;
          state.lastSearchTerm = searchTerm;
        }

        const metaFromTop = action.payload?.meta;
        state.pagination.page = metaFromTop?.page ?? page ?? 1;
        state.pagination.limit = metaFromTop?.limit ?? limit ?? 10;
        state.pagination.total = metaFromTop?.total ?? total ?? items.length;
        state.pagination.totalPages =
          metaFromTop?.totalPages ??
          totalPages ??
          Math.ceil(
            (state.pagination.total || 0) / (state.pagination.limit || 10),
          );
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.isSearching = false;
        state.error = action.payload as string;
      })
      // Create Room
      .addCase(createRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.rooms.push(action.payload.data);
        }
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Room
      .addCase(updateRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          const index = state.rooms.findIndex(
            (r) => r.id === action.payload.data?.id,
          );
          if (index !== -1) {
            state.rooms[index] = action.payload.data!;
          }
          if (state.currentRoom?.id === action.payload.data?.id) {
            state.currentRoom = action.payload.data!;
          }
        }
      })
      .addCase(updateRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Room Status
      .addCase(updateRoomStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRoomStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          const index = state.rooms.findIndex(
            (r) => r.id === action.payload.data?.id,
          );
          if (index !== -1) {
            state.rooms[index] = action.payload.data!;
          }
          if (state.currentRoom?.id === action.payload.data?.id) {
            state.currentRoom = action.payload.data!;
          }
        }
      })
      .addCase(updateRoomStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Room
      .addCase(deleteRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = state.rooms.filter((r) => r.id !== action.payload);
        if (state.currentRoom?.id === action.payload) {
          state.currentRoom = null;
        }
      })
      .addCase(deleteRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Bulk Create Rooms
      .addCase(bulkCreateRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkCreateRooms.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data && Array.isArray(action.payload.data)) {
          state.rooms.push(...action.payload.data);
        }
      })
      .addCase(bulkCreateRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Search Rooms
      .addCase(searchRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload.data || [];
        if (action.payload.meta) {
          state.pagination.page = action.payload.meta.page || 1;
          state.pagination.limit = action.payload.meta.limit || 10;
          state.pagination.total = action.payload.meta.total || 0;
          state.pagination.totalPages = action.payload.meta.totalPages || 0;
        }
      })
      .addCase(searchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Available Rooms (period-based)
      .addCase(fetchAvailableRooms.pending, (state) => {
        state.availableRoomsLoading = true;
        state.availableRoomsError = null;
      })
      .addCase(fetchAvailableRooms.fulfilled, (state, action) => {
        state.availableRoomsLoading = false;
        // Extract data from response (can be direct array or nested in data property)
        const payloadData = action.payload?.data || action.payload;
        state.availableRooms = Array.isArray(payloadData) ? payloadData : [];
      })
      .addCase(fetchAvailableRooms.rejected, (state, action) => {
        state.availableRoomsLoading = false;
        state.availableRoomsError = action.payload as string;
      });
  },
});

export const {
  setCurrentRoom,
  clearCurrentRoom,
  setLoading,
  setError,
  setPagination,
  setSearching,
  updateSearchCache,
  setLastSearchTerm,
} = roomSlice.actions;

export default roomSlice.reducer;
