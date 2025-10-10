import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { dormitoryService } from '@/services/room.service';
import { Dormitory, CreateDormitoryData, UpdateDormitoryData } from '@/types';

interface DormitoryState {
  dormitories: Dormitory[];
  currentDormitory: Dormitory | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  // Search optimization
  searchCache: Record<string, Dormitory[]>;
  lastSearchTerm: string;
  isSearching: boolean;
}

const initialState: DormitoryState = {
  dormitories: [],
  currentDormitory: null,
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
export const fetchDormitories = createAsyncThunk(
  'dormitory/fetchDormitories',
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      propertyId?: string;
      type?: string;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const response = await dormitoryService.getAll(params);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch dormitories';
      return rejectWithValue(errorMessage);
    }
  },
);

export const createDormitory = createAsyncThunk(
  'dormitory/createDormitory',
  async (data: CreateDormitoryData, { rejectWithValue }) => {
    try {
      const response = await dormitoryService.create(data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create dormitory';
      return rejectWithValue(errorMessage);
    }
  },
);

export const updateDormitory = createAsyncThunk(
  'dormitory/updateDormitory',
  async (
    { id, data }: { id: string; data: UpdateDormitoryData },
    { rejectWithValue },
  ) => {
    try {
      const response = await dormitoryService.update(id, data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update dormitory';
      return rejectWithValue(errorMessage);
    }
  },
);

export const deleteDormitory = createAsyncThunk(
  'dormitory/deleteDormitory',
  async (id: string, { rejectWithValue }) => {
    try {
      await dormitoryService.delete(id);
      return id;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete dormitory';
      return rejectWithValue(errorMessage);
    }
  },
);

export const searchDormitories = createAsyncThunk(
  'dormitory/searchDormitories',
  async (
    {
      query,
      params,
    }: { query: string; params?: { page?: number; limit?: number } },
    { rejectWithValue },
  ) => {
    try {
      const response = await dormitoryService.search(query, params);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to search dormitories';
      return rejectWithValue(errorMessage);
    }
  },
);

const dormitorySlice = createSlice({
  name: 'dormitory',
  initialState,
  reducers: {
    setCurrentDormitory: (state, action: PayloadAction<Dormitory>) => {
      state.currentDormitory = action.payload;
    },
    clearCurrentDormitory: (state) => {
      state.currentDormitory = null;
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
      action: PayloadAction<{ term: string; results: Dormitory[] }>,
    ) => {
      state.searchCache[action.payload.term] = action.payload.results;
    },
    setLastSearchTerm: (state, action: PayloadAction<string>) => {
      state.lastSearchTerm = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dormitories
      .addCase(fetchDormitories.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isSearching = true;
      })
      .addCase(fetchDormitories.fulfilled, (state, action) => {
        state.loading = false;
        state.isSearching = false;
        // Backend may return { success, data: Dormitory[] } or { success, data: { dormitories: Dormitory[], total, page, limit } }
        const payloadData = action.payload?.data as unknown;
        let items: Dormitory[] = [];
        let page: number | undefined;
        let limit: number | undefined;
        let total: number | undefined;
        let totalPages: number | undefined;

        if (Array.isArray(payloadData)) {
          items = payloadData as Dormitory[];
        } else if (payloadData && typeof payloadData === 'object') {
          const dataObj = payloadData as {
            dormitories?: Dormitory[];
            items?: Dormitory[];
            data?: Dormitory[];
            total?: number;
            page?: number;
            limit?: number;
            totalPages?: number;
          };
          items = (dataObj.dormitories ||
            dataObj.items ||
            dataObj.data ||
            []) as Dormitory[];
          page = dataObj.page;
          limit = dataObj.limit;
          total = dataObj.total;
          totalPages = dataObj.totalPages;
        }

        state.dormitories = items;

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
      .addCase(fetchDormitories.rejected, (state, action) => {
        state.loading = false;
        state.isSearching = false;
        state.error = action.payload as string;
      })
      // Create Dormitory
      .addCase(createDormitory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDormitory.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.dormitories.push(action.payload.data);
        }
      })
      .addCase(createDormitory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Dormitory
      .addCase(updateDormitory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDormitory.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          const index = state.dormitories.findIndex(
            (d) => d.id === action.payload.data?.id,
          );
          if (index !== -1) {
            state.dormitories[index] = action.payload.data!;
          }
          if (state.currentDormitory?.id === action.payload.data?.id) {
            state.currentDormitory = action.payload.data!;
          }
        }
      })
      .addCase(updateDormitory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Dormitory
      .addCase(deleteDormitory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDormitory.fulfilled, (state, action) => {
        state.loading = false;
        state.dormitories = state.dormitories.filter(
          (d) => d.id !== action.payload,
        );
        if (state.currentDormitory?.id === action.payload) {
          state.currentDormitory = null;
        }
      })
      .addCase(deleteDormitory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Search Dormitories
      .addCase(searchDormitories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchDormitories.fulfilled, (state, action) => {
        state.loading = false;
        state.dormitories = action.payload.data || [];
        if (action.payload.meta) {
          state.pagination.page = action.payload.meta.page || 1;
          state.pagination.limit = action.payload.meta.limit || 10;
          state.pagination.total = action.payload.meta.total || 0;
          state.pagination.totalPages = action.payload.meta.totalPages || 0;
        }
      })
      .addCase(searchDormitories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentDormitory,
  clearCurrentDormitory,
  setLoading,
  setError,
  setPagination,
  setSearching,
  updateSearchCache,
  setLastSearchTerm,
} = dormitorySlice.actions;

export default dormitorySlice.reducer;
