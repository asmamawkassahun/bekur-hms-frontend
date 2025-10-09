import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { propertyService } from '@/services/property.service';
import {
  Property,
  PropertyStats,
  CreatePropertyData,
  UpdatePropertyData,
} from '@/types';

interface PropertyState {
  properties: Property[];
  currentProperty: Property | null;
  propertyStats: PropertyStats | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: PropertyState = {
  properties: [],
  currentProperty: null,
  propertyStats: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks
export const fetchProperties = createAsyncThunk(
  'property/fetchProperties',
  async (
    params: { page?: number; limit?: number; search?: string } = {},
    { rejectWithValue },
  ) => {
    try {
      const response = await propertyService.getAll(params);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch properties';
      return rejectWithValue(errorMessage);
    }
  },
);

export const createProperty = createAsyncThunk(
  'property/createProperty',
  async (data: CreatePropertyData, { rejectWithValue }) => {
    try {
      const response = await propertyService.create(data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create property';
      return rejectWithValue(errorMessage);
    }
  },
);

export const updateProperty = createAsyncThunk(
  'property/updateProperty',
  async (
    { id, data }: { id: string; data: UpdatePropertyData },
    { rejectWithValue },
  ) => {
    try {
      const response = await propertyService.update(id, data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update property';
      return rejectWithValue(errorMessage);
    }
  },
);

export const deleteProperty = createAsyncThunk(
  'property/deleteProperty',
  async (id: string, { rejectWithValue }) => {
    try {
      await propertyService.delete(id);
      return id;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete property';
      return rejectWithValue(errorMessage);
    }
  },
);

export const fetchPropertyStats = createAsyncThunk(
  'property/fetchPropertyStats',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await propertyService.getStats(id);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch property stats';
      return rejectWithValue(errorMessage);
    }
  },
);

const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    setCurrentProperty: (state, action: PayloadAction<Property>) => {
      state.currentProperty = action.payload;
    },
    clearCurrentProperty: (state) => {
      state.currentProperty = null;
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
  },
  extraReducers: (builder) => {
    builder
      // Fetch Properties
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload.data || [];
        if (action.payload.meta) {
          state.pagination.page = action.payload.meta.page || 1;
          state.pagination.limit = action.payload.meta.limit || 10;
          state.pagination.total = action.payload.meta.total || 0;
          state.pagination.totalPages = action.payload.meta.totalPages || 0;
        }
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Property
      .addCase(createProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.properties.push(action.payload.data);
        }
      })
      .addCase(createProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Property
      .addCase(updateProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          const index = state.properties.findIndex(
            (p) => p.id === action.payload.data?.id,
          );
          if (index !== -1) {
            state.properties[index] = action.payload.data!;
          }
          if (state.currentProperty?.id === action.payload.data?.id) {
            state.currentProperty = action.payload.data!;
          }
        }
      })
      .addCase(updateProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Property
      .addCase(deleteProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = state.properties.filter(
          (p) => p.id !== action.payload,
        );
        if (state.currentProperty?.id === action.payload) {
          state.currentProperty = null;
        }
      })
      .addCase(deleteProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Property Stats
      .addCase(fetchPropertyStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPropertyStats.fulfilled, (state, action) => {
        state.loading = false;
        state.propertyStats = action.payload.data || null;
      })
      .addCase(fetchPropertyStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentProperty,
  clearCurrentProperty,
  setLoading,
  setError,
  setPagination,
} = propertySlice.actions;

export default propertySlice.reducer;
