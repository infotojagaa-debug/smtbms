import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const initialState = {
  vendors: [],
  orders: [],
  invoices: [],
  expenses: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

const getAuthHeader = () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  return user ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
};

// Vendor Thunks
export const fetchVendors = createAsyncThunk('erp/fetchVendors', async (_, thunkAPI) => {
  try {
    const response = await api.get('/api/vendors', getAuthHeader());
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Order Thunks
export const fetchOrders = createAsyncThunk('erp/fetchOrders', async (_, thunkAPI) => {
  try {
    const response = await api.get('/api/orders', getAuthHeader());
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateOrderStatus = createAsyncThunk('erp/updateStatus', async ({ id, status }, thunkAPI) => {
  try {
    const response = await api.patch(`/api/orders/${id}/status`, { status }, getAuthHeader());
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Finance Thunks
export const createOrder = createAsyncThunk('erp/createOrder', async (orderData, thunkAPI) => {
  try {
    const response = await api.post('/api/orders', orderData, getAuthHeader());
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const fetchInvoices = createAsyncThunk('erp/fetchInvoices', async (_, thunkAPI) => {
  try {
    const response = await api.get('/api/finance/invoices', getAuthHeader());
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const fetchExpenses = createAsyncThunk('erp/fetchExpenses', async (_, thunkAPI) => {
  try {
    const response = await api.get('/api/finance/expenses', getAuthHeader());
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const erpSlice = createSlice({
  name: 'erp',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.vendors = action.payload;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.orders = state.orders.map(o => o._id === action.payload.order._id ? action.payload.order : o);
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.invoices = action.payload;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.expenses = action.payload;
      });
  },
});

export const { reset } = erpSlice.actions;
export default erpSlice.reducer;

