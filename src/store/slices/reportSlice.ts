import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reportService } from '@/services/report.service';
import type { ReportsSummary, ReportsQueryParams } from '@/types/report.types';

interface ReportState {
  summary: ReportsSummary | null;
  loading: boolean;
  error: string | null;
}

const initialState: ReportState = {
  summary: null,
  loading: false,
  error: null,
};

export const fetchReportsSummary = createAsyncThunk(
  'reports/fetchSummary',
  async (params: ReportsQueryParams | undefined, { rejectWithValue }) => {
    try {
      const res = await reportService.getSummary(params);
      return res.data;
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : 'Failed to fetch reports');
    }
  },
);

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReportsSummary.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchReportsSummary.fulfilled, (state, action) => {
        state.loading = false; state.summary = action.payload.data || null;
      })
      .addCase(fetchReportsSummary.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      });
  },
});

export default reportSlice.reducer;


