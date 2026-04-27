import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const API_URL = '/api/erp/payments';
const getAuth = () => ({ headers: { Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}` } });

export const fetchPayments = createAsyncThunk('payments/fetch', async (params, thunk) => {
  try { return (await api.get(API_URL, { ...getAuth(), params })).data; } 
  catch (e) { return thunk.rejectWithValue(e.response.data.message); }
});

const paymentSlice = createSlice({
  name: 'payments',
  initialState: { payments: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchPayments.fulfilled, (state, action) => { state.payments = action.payload; });
  }
});

export default paymentSlice.reducer;

