import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/erp/budgets';
const getAuth = () => ({ headers: { Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}` } });

export const fetchBudgets = createAsyncThunk('budgets/fetch', async (_, thunk) => {
  try { return (await axios.get(API_URL, getAuth())).data; } 
  catch (e) { return thunk.rejectWithValue(e.response.data.message); }
});

const budgetSlice = createSlice({
  name: 'budgets',
  initialState: { budgets: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchBudgets.fulfilled, (state, action) => { state.budgets = action.payload; });
  }
});

export default budgetSlice.reducer;
