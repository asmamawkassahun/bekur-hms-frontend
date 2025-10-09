import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { paymentService } from '@/services/payment.service';
import type {
  Payment,
  CreatePaymentData,
  UpdatePaymentData,
  RefundPaymentData,
} from '@/types/payment.types';

interface PaymentState {
  payments: Payment[];
  currentPayment: Payment | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: PaymentState = {
  payments: [],
  currentPayment: null,
  loading: false,
  error: null,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
};

export const fetchPayments = createAsyncThunk(
  'payment/fetchPayments',
  async (params: { page?: number; limit?: number; search?: string } = {}, { rejectWithValue }) => {
    try {
      const res = await paymentService.getAll(params);
      return res.data;
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : 'Failed to fetch payments');
    }
  },
);

export const createPayment = createAsyncThunk(
  'payment/createPayment',
  async (data: CreatePaymentData, { rejectWithValue }) => {
    try {
      const res = await paymentService.create(data);
      return res.data;
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : 'Failed to create payment');
    }
  },
);

export const updatePayment = createAsyncThunk(
  'payment/updatePayment',
  async ({ id, data }: { id: string; data: UpdatePaymentData }, { rejectWithValue }) => {
    try {
      const res = await paymentService.update(id, data);
      return res.data;
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : 'Failed to update payment');
    }
  },
);

export const refundPayment = createAsyncThunk(
  'payment/refundPayment',
  async ({ id, data }: { id: string; data: RefundPaymentData }, { rejectWithValue }) => {
    try {
      const res = await paymentService.refund(id, data);
      return res.data;
    } catch (e: unknown) {
      return rejectWithValue(e instanceof Error ? e.message : 'Failed to refund payment');
    }
  },
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload.data || [];
        if (action.payload.meta) {
          state.pagination.page = action.payload.meta.page || 1;
          state.pagination.limit = action.payload.meta.limit || 10;
          state.pagination.total = action.payload.meta.total || 0;
          state.pagination.totalPages = action.payload.meta.totalPages || 0;
        }
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        if (action.payload.data) state.payments.unshift(action.payload.data);
      })
      .addCase(updatePayment.fulfilled, (state, action) => {
        if (action.payload.data) {
          const idx = state.payments.findIndex((p) => p.id === action.payload.data?.id);
          if (idx !== -1) state.payments[idx] = action.payload.data!;
        }
      })
      .addCase(refundPayment.fulfilled, (state, action) => {
        if (action.payload.data) {
          const idx = state.payments.findIndex((p) => p.id === action.payload.data?.id);
          if (idx !== -1) state.payments[idx] = action.payload.data!;
        }
      });
  },
});

export default paymentSlice.reducer;


