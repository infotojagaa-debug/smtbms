import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const API_URL = '/api/erp/po';
const getAuth = () => ({ headers: { Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}` } });

export const fetchPOs = createAsyncThunk('po/fetch', async (params, thunk) => {
  try { return (await api.get(API_URL, { ...getAuth(), params })).data; } 
  catch (e) { return thunk.rejectWithValue(e.response.data.message); }
});

export const createPO = createAsyncThunk('po/create', async (data, thunk) => {
  try { return (await api.post(API_URL, data, getAuth())).data; } 
  catch (e) { return thunk.rejectWithValue(e.response.data.message); }
});

const poSlice = createSlice({
  name: 'purchaseOrders',
  initialState: { orders: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPOs.fulfilled, (state, action) => { state.orders = action.payload; })
      .addCase(createPO.fulfilled, (state, action) => { state.orders.unshift(action.payload); });
  }
});

export default poSlice.reducer;

