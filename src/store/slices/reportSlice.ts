import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reportService } from '@/services/report.service';
import type {
  ReportsSummary,
  ReportsQueryParams,
  GenerateReportDto,
  ReportQueryDto,
  ReportResponse,
  ReportsListResponse,
  OccupancyReportData,
  RevenueReportData,
  OperationalReportData,
  FinancialReportData,
  GuestAnalyticsReportData,
} from '@/types/report.types';
import { ReportType } from '@/types/report.types';

interface ReportState {
  // Legacy summary
  summary: ReportsSummary | null;
  
  // Generated reports by type
  generatedReports: {
    [ReportType.OCCUPANCY]?: OccupancyReportData;
    [ReportType.REVENUE]?: RevenueReportData;
    [ReportType.OPERATIONAL]?: OperationalReportData;
    [ReportType.FINANCIAL]?: FinancialReportData;
    [ReportType.GUEST_ANALYTICS]?: GuestAnalyticsReportData;
  };
  
  // Saved reports
  savedReports: ReportsListResponse | null;
  selectedReport: ReportResponse | null;
  
  // UI state
  activeTab: ReportType;
  filters: {
    propertyId?: string;
    startDate: string;
    endDate: string;
    groupBy: 'day' | 'week' | 'month' | 'year';
    includeCharts: boolean;
    roomTypeId?: string;
    dormitoryId?: string;
    paymentMethod?: string;
    guestId?: string;
  };
  
  // Loading states
  loading: {
    summary: boolean;
    generating: { [key in ReportType]: boolean };
    savedReports: boolean;
    selectedReport: boolean;
    deleting: boolean;
  };
  
  error: string | null;
}

const initialState: ReportState = {
  summary: null,
  generatedReports: {},
  savedReports: null,
  selectedReport: null,
  activeTab: ReportType.OCCUPANCY,
  filters: {
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    groupBy: 'day',
    includeCharts: true,
  },
  loading: {
    summary: false,
    generating: {
      [ReportType.OCCUPANCY]: false,
      [ReportType.REVENUE]: false,
      [ReportType.OPERATIONAL]: false,
      [ReportType.FINANCIAL]: false,
      [ReportType.GUEST_ANALYTICS]: false,
    },
    savedReports: false,
    selectedReport: false,
    deleting: false,
  },
  error: null,
};

// Legacy summary
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

// Generate reports
export const generateOccupancyReport = createAsyncThunk(
  'reports/generateOccupancy',
  async (data: Omit<GenerateReportDto, 'type'>, { rejectWithValue }) => {
    try {
      const res = await reportService.generateOccupancyReport(data);
      return res.data?.data?.data as OccupancyReportData;
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : 'Failed to generate occupancy report');
    }
  },
);

export const generateRevenueReport = createAsyncThunk(
  'reports/generateRevenue',
  async (data: Omit<GenerateReportDto, 'type'>, { rejectWithValue }) => {
    try {
      const res = await reportService.generateRevenueReport(data);
      return res.data?.data?.data as RevenueReportData;
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : 'Failed to generate revenue report');
    }
  },
);

export const generateOperationalReport = createAsyncThunk(
  'reports/generateOperational',
  async (data: Omit<GenerateReportDto, 'type'>, { rejectWithValue }) => {
    try {
      const res = await reportService.generateOperationalReport(data);
      return res.data?.data?.data as OperationalReportData;
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : 'Failed to generate operational report');
    }
  },
);

export const generateFinancialReport = createAsyncThunk(
  'reports/generateFinancial',
  async (data: Omit<GenerateReportDto, 'type'>, { rejectWithValue }) => {
    try {
      const res = await reportService.generateFinancialReport(data);
      return res.data?.data?.data as FinancialReportData;
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : 'Failed to generate financial report');
    }
  },
);

export const generateGuestAnalyticsReport = createAsyncThunk(
  'reports/generateGuestAnalytics',
  async (data: Omit<GenerateReportDto, 'type'>, { rejectWithValue }) => {
    try {
      const res = await reportService.generateGuestAnalyticsReport(data);
      return res.data?.data?.data as GuestAnalyticsReportData;
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : 'Failed to generate guest analytics report');
    }
  },
);

// Saved reports
export const fetchSavedReports = createAsyncThunk(
  'reports/fetchSaved',
  async (params: ReportQueryDto | undefined, { rejectWithValue }) => {
    try {
      const res = await reportService.listReports(params);
      return res.data;
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : 'Failed to fetch saved reports');
    }
  },
);

export const fetchReportById = createAsyncThunk(
  'reports/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await reportService.getReportById(id);
      return res.data;
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : 'Failed to fetch report');
    }
  },
);

export const deleteReport = createAsyncThunk(
  'reports/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await reportService.deleteReport(id);
      return id;
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : 'Failed to delete report');
    }
  },
);

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearGeneratedReport: (state, action) => {
      delete state.generatedReports[action.payload as ReportType];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Legacy summary
      .addCase(fetchReportsSummary.pending, (state) => {
        state.loading.summary = true;
        state.error = null;
      })
      .addCase(fetchReportsSummary.fulfilled, (state, action) => {
        state.loading.summary = false;
        state.summary = action.payload.data || null;
      })
      .addCase(fetchReportsSummary.rejected, (state, action) => {
        state.loading.summary = false;
        state.error = action.payload as string;
      })
      
      // Generate occupancy report
      .addCase(generateOccupancyReport.pending, (state) => {
        state.loading.generating[ReportType.OCCUPANCY] = true;
        state.error = null;
      })
      .addCase(generateOccupancyReport.fulfilled, (state, action) => {
        state.loading.generating[ReportType.OCCUPANCY] = false;
        state.generatedReports[ReportType.OCCUPANCY] = action.payload;
      })
      .addCase(generateOccupancyReport.rejected, (state, action) => {
        state.loading.generating[ReportType.OCCUPANCY] = false;
        state.error = action.payload as string;
      })
      
      // Generate revenue report
      .addCase(generateRevenueReport.pending, (state) => {
        state.loading.generating[ReportType.REVENUE] = true;
        state.error = null;
      })
      .addCase(generateRevenueReport.fulfilled, (state, action) => {
        state.loading.generating[ReportType.REVENUE] = false;
        state.generatedReports[ReportType.REVENUE] = action.payload;
      })
      .addCase(generateRevenueReport.rejected, (state, action) => {
        state.loading.generating[ReportType.REVENUE] = false;
        state.error = action.payload as string;
      })
      
      // Generate operational report
      .addCase(generateOperationalReport.pending, (state) => {
        state.loading.generating[ReportType.OPERATIONAL] = true;
        state.error = null;
      })
      .addCase(generateOperationalReport.fulfilled, (state, action) => {
        state.loading.generating[ReportType.OPERATIONAL] = false;
        state.generatedReports[ReportType.OPERATIONAL] = action.payload;
      })
      .addCase(generateOperationalReport.rejected, (state, action) => {
        state.loading.generating[ReportType.OPERATIONAL] = false;
        state.error = action.payload as string;
      })
      
      // Generate financial report
      .addCase(generateFinancialReport.pending, (state) => {
        state.loading.generating[ReportType.FINANCIAL] = true;
        state.error = null;
      })
      .addCase(generateFinancialReport.fulfilled, (state, action) => {
        state.loading.generating[ReportType.FINANCIAL] = false;
        state.generatedReports[ReportType.FINANCIAL] = action.payload;
      })
      .addCase(generateFinancialReport.rejected, (state, action) => {
        state.loading.generating[ReportType.FINANCIAL] = false;
        state.error = action.payload as string;
      })
      
      // Generate guest analytics report
      .addCase(generateGuestAnalyticsReport.pending, (state) => {
        state.loading.generating[ReportType.GUEST_ANALYTICS] = true;
        state.error = null;
      })
      .addCase(generateGuestAnalyticsReport.fulfilled, (state, action) => {
        state.loading.generating[ReportType.GUEST_ANALYTICS] = false;
        state.generatedReports[ReportType.GUEST_ANALYTICS] = action.payload;
      })
      .addCase(generateGuestAnalyticsReport.rejected, (state, action) => {
        state.loading.generating[ReportType.GUEST_ANALYTICS] = false;
        state.error = action.payload as string;
      })
      
      // Fetch saved reports
      .addCase(fetchSavedReports.pending, (state) => {
        state.loading.savedReports = true;
        state.error = null;
      })
      .addCase(fetchSavedReports.fulfilled, (state, action) => {
        state.loading.savedReports = false;
        state.savedReports = action.payload;
      })
      .addCase(fetchSavedReports.rejected, (state, action) => {
        state.loading.savedReports = false;
        state.error = action.payload as string;
      })
      
      // Fetch report by ID
      .addCase(fetchReportById.pending, (state) => {
        state.loading.selectedReport = true;
        state.error = null;
      })
      .addCase(fetchReportById.fulfilled, (state, action) => {
        state.loading.selectedReport = false;
        state.selectedReport = action.payload;
      })
      .addCase(fetchReportById.rejected, (state, action) => {
        state.loading.selectedReport = false;
        state.error = action.payload as string;
      })
      
      // Delete report
      .addCase(deleteReport.pending, (state) => {
        state.loading.deleting = true;
        state.error = null;
      })
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.loading.deleting = false;
        if (state.savedReports?.data) {
          state.savedReports.data = state.savedReports.data.filter(r => r.id !== action.payload);
        }
      })
      .addCase(deleteReport.rejected, (state, action) => {
        state.loading.deleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { setActiveTab, updateFilters, clearGeneratedReport, clearError } = reportSlice.actions;
export default reportSlice.reducer;


