import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const API_URL = '/api/crm/communications';
const getAuth = () => ({ headers: { Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}` } });

export const fetchCommunications = createAsyncThunk('communications/fetch', async (params, thunk) => {
  try { return (await api.get(API_URL, { ...getAuth(), params })).data; } 
  catch (e) { return thunk.rejectWithValue(e.response.data.message); }
});

const communicationSlice = createSlice({
  name: 'communications',
  initialState: { communications: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCommunications.fulfilled, (state, action) => { state.communications = action.payload; });
  }
});

export default communicationSlice.reducer;

