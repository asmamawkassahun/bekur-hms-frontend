import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { invoiceService } from '@/services/invoice.service';
import type { Invoice, CreateInvoiceData, UpdateInvoiceData, SendInvoiceData } from '@/types/invoice.types';

interface InvoiceState {
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  loading: boolean;
  error: string | null;
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const initialState: InvoiceState = {
  invoices: [],
  currentInvoice: null,
  loading: false,
  error: null,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
};

export const fetchInvoices = createAsyncThunk(
  'invoice/fetchInvoices',
  async (params: { page?: number; limit?: number; search?: string } = {}, { rejectWithValue }) => {
    try {
      const res = await invoiceService.getAll(params);
      return res.data;
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : 'Failed to fetch invoices');
    }
  },
);

export const createInvoice = createAsyncThunk(
  'invoice/createInvoice',
  async (data: CreateInvoiceData, { rejectWithValue }) => {
    try {
      const res = await invoiceService.create(data);
      return res.data;
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : 'Failed to create invoice');
    }
  },
);

export const updateInvoice = createAsyncThunk(
  'invoice/updateInvoice',
  async ({ id, data }: { id: string; data: UpdateInvoiceData }, { rejectWithValue }) => {
    try {
      const res = await invoiceService.update(id, data);
      return res.data;
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : 'Failed to update invoice');
    }
  },
);

export const sendInvoice = createAsyncThunk(
  'invoice/sendInvoice',
  async ({ id, data }: { id: string; data: SendInvoiceData }, { rejectWithValue }) => {
    try {
      const res = await invoiceService.send(id, data);
      return res.data;
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : 'Failed to send invoice');
    }
  },
);

const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload.data || [];
        if (action.payload.meta) {
          state.pagination.page = action.payload.meta.page || 1;
          state.pagination.limit = action.payload.meta.limit || 10;
          state.pagination.total = action.payload.meta.total || 0;
          state.pagination.totalPages = action.payload.meta.totalPages || 0;
        }
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        if (action.payload.data) state.invoices.unshift(action.payload.data);
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        if (action.payload.data) {
          const idx = state.invoices.findIndex((i) => i.id === action.payload.data?.id);
          if (idx !== -1) state.invoices[idx] = action.payload.data!;
        }
      })
      .addCase(sendInvoice.fulfilled, (state, action) => {
        if (action.payload.data) {
          const idx = state.invoices.findIndex((i) => i.id === action.payload.data?.id);
          if (idx !== -1) state.invoices[idx] = action.payload.data!;
        }
      });
  },
});

export default invoiceSlice.reducer;


