import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/crm/leads';
const getAuth = () => ({ headers: { Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}` } });

export const fetchLeadPipeline = createAsyncThunk('leads/fetchPipeline', async (_, thunk) => {
  try { return (await axios.get(`${API_URL}/pipeline`, getAuth())).data; } 
  catch (e) { return thunk.rejectWithValue(e.response.data.message); }
});

const leadSlice = createSlice({
  name: 'leads',
  initialState: { pipeline: {}, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchLeadPipeline.fulfilled, (state, action) => { state.pipeline = action.payload; });
  }
});

export default leadSlice.reducer;
