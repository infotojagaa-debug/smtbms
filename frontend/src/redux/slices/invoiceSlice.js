import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/erp/invoices';
const getAuth = () => ({ headers: { Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}` } });

export const fetchInvoices = createAsyncThunk('invoices/fetch', async (params, thunk) => {
  try { return (await axios.get(API_URL, { ...getAuth(), params })).data; } 
  catch (e) { return thunk.rejectWithValue(e.response.data.message); }
});

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState: { invoices: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchInvoices.fulfilled, (state, action) => { state.invoices = action.payload; });
  }
});

export default invoiceSlice.reducer;
