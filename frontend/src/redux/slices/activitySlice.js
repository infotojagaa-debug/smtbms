import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/crm/activities';
const getAuth = () => ({ headers: { Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}` } });

export const fetchTodayActivities = createAsyncThunk('activities/fetchToday', async (_, thunk) => {
  try { return (await axios.get(`${API_URL}/today`, getAuth())).data; } 
  catch (e) { return thunk.rejectWithValue(e.response.data.message); }
});

const activitySlice = createSlice({
  name: 'activities',
  initialState: { today: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTodayActivities.fulfilled, (state, action) => { state.today = action.payload; });
  }
});

export default activitySlice.reducer;
