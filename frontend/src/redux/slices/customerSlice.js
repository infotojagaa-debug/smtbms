import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const API_URL = '/api/crm/customers';
const getAuth = () => ({ headers: { Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}` } });

export const fetchCustomers = createAsyncThunk('customers/fetch', async (params, thunk) => {
  try { return (await api.get(API_URL, { ...getAuth(), params })).data; } 
  catch (e) { return thunk.rejectWithValue(e.response.data.message); }
});

export const fetchCustomerDetails = createAsyncThunk('customers/fetchDetails', async (id, thunk) => {
  try { return (await api.get(`${API_URL}/${id}`, getAuth())).data; } 
  catch (e) { return thunk.rejectWithValue(e.response.data.message); }
});

const customerSlice = createSlice({
  name: 'customers',
  initialState: { customers: [], selectedCustomer: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.fulfilled, (state, action) => { state.customers = action.payload.customers; })
      .addCase(fetchCustomerDetails.fulfilled, (state, action) => { state.selectedCustomer = action.payload; });
  }
});

export default customerSlice.reducer;

