import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Property } from '@/types';

interface PropertyState {
  currentProperty: Property | null;
  properties: Property[];
  loading: boolean;
  error: string | null;
}

const initialState: PropertyState = {
  currentProperty: null,
  properties: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchProperties = createAsyncThunk(
  'property/fetchProperties',
  async (_, { rejectWithValue }) => {
    try {
      // This would be replaced with actual API call
      // const response = await propertyService.getAll();
      // return response.data;

      // Mock data for now
      return [
        {
          id: '1',
          name: 'Bekur Hotel',
          type: 'HOTEL' as const,
          address: '123 Main Street',
          city: 'New York',
          country: 'USA',
          phone: '+1-555-0123',
          email: 'info@bekurhotel.com',
          isActive: true,
        },
      ];
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch properties';
      return rejectWithValue(errorMessage);
    }
  },
);

export const setCurrentProperty = createAsyncThunk(
  'property/setCurrentProperty',
  async (propertyId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { property: PropertyState };
      const property = state.property.properties.find(
        (p) => p.id === propertyId,
      );

      if (!property) {
        throw new Error('Property not found');
      }

      return property;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to set current property';
      return rejectWithValue(errorMessage);
    }
  },
);

const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch properties
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload;
        state.error = null;

        // Set first property as current if none selected
        if (!state.currentProperty && action.payload.length > 0) {
          state.currentProperty = action.payload[0];
        }
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Set current property
      .addCase(setCurrentProperty.fulfilled, (state, action) => {
        state.currentProperty = action.payload;
      })
      .addCase(setCurrentProperty.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setLoading } = propertySlice.actions;
export default propertySlice.reducer;
