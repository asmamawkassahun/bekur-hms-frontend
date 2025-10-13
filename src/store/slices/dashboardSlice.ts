import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  dashboardService,
  DashboardOverview,
} from '@/services/dashboard.service';

interface DashboardState {
  overview: DashboardOverview | null;
  loading: boolean;
  error: string | null;
  selectedPeriod: 'TODAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
  selectedPropertyId: string | null;
}

const initialState: DashboardState = {
  overview: null,
  loading: false,
  error: null,
  selectedPeriod: 'MONTH',
  selectedPropertyId: null,
};

export const fetchDashboardOverview = createAsyncThunk(
  'dashboard/fetchOverview',
  async (params: {
    propertyId?: string;
    period?: 'TODAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
    silent?: boolean; // Flag for background refreshes
  }) => {
    const response = await dashboardService.getOverview(params);
    return response.data.data;
  },
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setSelectedPeriod: (state, action) => {
      state.selectedPeriod = action.payload;
    },
    setSelectedProperty: (state, action) => {
      state.selectedPropertyId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardOverview.pending, (state, action) => {
        // Only show loading state if not a silent background refresh
        const isSilent = action.meta.arg.silent;
        if (!isSilent) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchDashboardOverview.fulfilled, (state, action) => {
        state.loading = false;
        // Only update if data actually changed (prevent unnecessary re-renders)
        const newData = action.payload ?? null;
        const hasChanged = JSON.stringify(state.overview) !== JSON.stringify(newData);

        if (hasChanged) {
          state.overview = newData;
        }
      })
      .addCase(fetchDashboardOverview.rejected, (state, action) => {
        state.loading = false;
        // Only show errors for non-silent requests
        const isSilent = action.meta.arg.silent;
        if (!isSilent) {
          state.error = action.error.message || 'Failed to fetch dashboard data';
        }
      });
  },
});

export const { setSelectedPeriod, setSelectedProperty } =
  dashboardSlice.actions;
export default dashboardSlice.reducer;
