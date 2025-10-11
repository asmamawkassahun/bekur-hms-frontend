import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardService, DashboardOverview } from '@/services/dashboard.service';

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
  async (params: { propertyId?: string; period?: string }) => {
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
      .addCase(fetchDashboardOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.overview = action.payload;
      })
      .addCase(fetchDashboardOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch dashboard data';
      });
  },
});

export const { setSelectedPeriod, setSelectedProperty } = dashboardSlice.actions;
export default dashboardSlice.reducer;

