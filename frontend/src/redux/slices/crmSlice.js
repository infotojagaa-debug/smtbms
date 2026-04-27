import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const initialState = {
  leads: [],
  customers: [],
  deals: [],
  interactions: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

const getAuthHeader = () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  return user ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
};

// Lead Thunks
export const fetchLeads = createAsyncThunk('crm/fetchLeads', async (_, thunkAPI) => {
  try {
    const response = await api.get('/api/leads', getAuthHeader());
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const convertLead = createAsyncThunk('crm/convertLead', async (id, thunkAPI) => {
  try {
    const response = await api.post(`/api/leads/${id}/convert`, {}, getAuthHeader());
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Deal Thunks
export const fetchDeals = createAsyncThunk('crm/fetchDeals', async (_, thunkAPI) => {
  try {
    const response = await api.get('/api/deals', getAuthHeader());
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateDealStage = createAsyncThunk('crm/updateDeal', async ({ id, stage }, thunkAPI) => {
  try {
    const response = await api.patch(`/api/deals/${id}`, { stage }, getAuthHeader());
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Customer Thunks
export const fetchCustomers = createAsyncThunk('crm/fetchCustomers', async (_, thunkAPI) => {
  try {
    const response = await api.get('/api/customers', getAuthHeader());
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const crmSlice = createSlice({
  name: 'crm',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.leads = action.payload;
      })
      .addCase(convertLead.fulfilled, (state) => {
        state.isSuccess = true;
      })
      .addCase(fetchDeals.fulfilled, (state, action) => {
        state.deals = action.payload;
      })
      .addCase(updateDealStage.fulfilled, (state, action) => {
        state.deals = state.deals.map(d => d._id === action.payload._id ? action.payload : d);
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.customers = action.payload;
      });
  },
});

export const { reset } = crmSlice.actions;
export default crmSlice.reducer;

