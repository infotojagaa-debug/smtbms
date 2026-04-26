import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/crm/deals';
const getAuth = () => ({ headers: { Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}` } });

export const fetchDeals = createAsyncThunk('deals/fetch', async (params, thunk) => {
  try { return (await axios.get(API_URL, { ...getAuth(), params })).data; } 
  catch (e) { return thunk.rejectWithValue(e.response.data.message); }
});

const dealSlice = createSlice({
  name: 'deals',
  initialState: { deals: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchDeals.fulfilled, (state, action) => { state.deals = action.payload; });
  }
});

export default dealSlice.reducer;
