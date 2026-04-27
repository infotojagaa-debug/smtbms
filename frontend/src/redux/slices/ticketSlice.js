import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const API_URL = '/api/crm/tickets';
const getAuth = () => ({ headers: { Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}` } });

export const fetchTickets = createAsyncThunk('tickets/fetch', async (params, thunk) => {
  try { return (await api.get(API_URL, { ...getAuth(), params })).data; } 
  catch (e) { return thunk.rejectWithValue(e.response.data.message); }
});

const ticketSlice = createSlice({
  name: 'tickets',
  initialState: { tickets: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTickets.fulfilled, (state, action) => { state.tickets = action.payload; });
  }
});

export default ticketSlice.reducer;

