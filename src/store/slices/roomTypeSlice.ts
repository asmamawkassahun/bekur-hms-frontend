import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { roomTypeService } from '@/services/room-type.service';
import { RoomType, CreateRoomTypeData, UpdateRoomTypeData } from '@/types';

interface RoomTypeState {
  roomTypes: RoomType[];
  currentRoomType: RoomType | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  // Search optimization
  searchCache: Record<string, RoomType[]>;
  lastSearchTerm: string;
  isSearching: boolean;
}

const initialState: RoomTypeState = {
  roomTypes: [],
  currentRoomType: null,
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
};

// Async thunks
export const fetchRoomTypes = createAsyncThunk(
  'roomType/fetchRoomTypes',
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      propertyId?: string;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const response = await roomTypeService.getAll(params);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch room types';
      return rejectWithValue(errorMessage);
    }
  },
);

export const createRoomType = createAsyncThunk(
  'roomType/createRoomType',
  async (data: CreateRoomTypeData, { rejectWithValue }) => {
    try {
      const response = await roomTypeService.create(data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create room type';
      return rejectWithValue(errorMessage);
    }
  },
);

export const updateRoomType = createAsyncThunk(
  'roomType/updateRoomType',
  async (
    { id, data }: { id: string; data: UpdateRoomTypeData },
    { rejectWithValue },
  ) => {
    try {
      const response = await roomTypeService.update(id, data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update room type';
      return rejectWithValue(errorMessage);
    }
  },
);

export const deleteRoomType = createAsyncThunk(
  'roomType/deleteRoomType',
  async (id: string, { rejectWithValue }) => {
    try {
      await roomTypeService.delete(id);
      return id;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete room type';
      return rejectWithValue(errorMessage);
    }
  },
);

export const searchRoomTypes = createAsyncThunk(
  'roomType/searchRoomTypes',
  async (
    {
      query,
      params,
    }: { query: string; params?: { page?: number; limit?: number } },
    { rejectWithValue },
  ) => {
    try {
      const response = await roomTypeService.search(query, params);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to search room types';
      return rejectWithValue(errorMessage);
    }
  },
);

const roomTypeSlice = createSlice({
  name: 'roomType',
  initialState,
  reducers: {
    setCurrentRoomType: (state, action: PayloadAction<RoomType>) => {
      state.currentRoomType = action.payload;
    },
    clearCurrentRoomType: (state) => {
      state.currentRoomType = null;
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
      action: PayloadAction<{ term: string; results: RoomType[] }>,
    ) => {
      state.searchCache[action.payload.term] = action.payload.results;
    },
    setLastSearchTerm: (state, action: PayloadAction<string>) => {
      state.lastSearchTerm = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Room Types
      .addCase(fetchRoomTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isSearching = true;
      })
      .addCase(fetchRoomTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.isSearching = false;
        // Backend may return { success, data: RoomType[] } or { success, data: { roomTypes: RoomType[], total, page, limit } }
        const payloadData = action.payload?.data as unknown;
        let items: RoomType[] = [];
        let page: number | undefined;
        let limit: number | undefined;
        let total: number | undefined;
        let totalPages: number | undefined;

        if (Array.isArray(payloadData)) {
          items = payloadData as RoomType[];
        } else if (payloadData && typeof payloadData === 'object') {
          const dataObj = payloadData as {
            roomTypes?: RoomType[];
            items?: RoomType[];
            data?: RoomType[];
            total?: number;
            page?: number;
            limit?: number;
            totalPages?: number;
          };
          items = (dataObj.roomTypes ||
            dataObj.items ||
            dataObj.data ||
            []) as RoomType[];
          page = dataObj.page;
          limit = dataObj.limit;
          total = dataObj.total;
          totalPages = dataObj.totalPages;
        }

        state.roomTypes = items;

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
      .addCase(fetchRoomTypes.rejected, (state, action) => {
        state.loading = false;
        state.isSearching = false;
        state.error = action.payload as string;
      })
      // Create Room Type
      .addCase(createRoomType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRoomType.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.roomTypes.push(action.payload.data);
        }
      })
      .addCase(createRoomType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Room Type
      .addCase(updateRoomType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRoomType.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          const index = state.roomTypes.findIndex(
            (rt) => rt.id === action.payload.data?.id,
          );
          if (index !== -1) {
            state.roomTypes[index] = action.payload.data!;
          }
          if (state.currentRoomType?.id === action.payload.data?.id) {
            state.currentRoomType = action.payload.data!;
          }
        }
      })
      .addCase(updateRoomType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Room Type
      .addCase(deleteRoomType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRoomType.fulfilled, (state, action) => {
        state.loading = false;
        state.roomTypes = state.roomTypes.filter(
          (rt) => rt.id !== action.payload,
        );
        if (state.currentRoomType?.id === action.payload) {
          state.currentRoomType = null;
        }
      })
      .addCase(deleteRoomType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Search Room Types
      .addCase(searchRoomTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchRoomTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.roomTypes = action.payload.data || [];
        if (action.payload.meta) {
          state.pagination.page = action.payload.meta.page || 1;
          state.pagination.limit = action.payload.meta.limit || 10;
          state.pagination.total = action.payload.meta.total || 0;
          state.pagination.totalPages = action.payload.meta.totalPages || 0;
        }
      })
      .addCase(searchRoomTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentRoomType,
  clearCurrentRoomType,
  setLoading,
  setError,
  setPagination,
  setSearching,
  updateSearchCache,
  setLastSearchTerm,
} = roomTypeSlice.actions;

export default roomTypeSlice.reducer;
