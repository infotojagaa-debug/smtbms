import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const API_URL = '/api/erp';
const getAuth = () => ({ headers: { Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}` } });

export const fetchVendors = createAsyncThunk('vendors/fetch', async (params, thunk) => {
  try { return (await api.get(`${API_URL}/vendors`, { ...getAuth(), params })).data; } 
  catch (e) { return thunk.rejectWithValue(e.response.data.message); }
});

export const createVendor = createAsyncThunk('vendors/create', async (data, thunk) => {
  try { return (await api.post(`${API_URL}/vendors`, data, getAuth())).data; } 
  catch (e) { return thunk.rejectWithValue(e.response.data.message); }
});

const vendorSlice = createSlice({
  name: 'vendors',
  initialState: { vendors: [], stats: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendors.pending, (state) => { state.loading = true; })
      .addCase(fetchVendors.fulfilled, (state, action) => { state.loading = false; state.vendors = action.payload.vendors; })
      .addCase(fetchVendors.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  }
});

export default vendorSlice.reducer;

