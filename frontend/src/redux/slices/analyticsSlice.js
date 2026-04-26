import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const API_URL = '/api/analytics';



export const fetchAdminStats = createAsyncThunk('analytics/fetchAdmin', async (_, thunk) => {
  try {
    const res = await api.get(`${API_URL}/admin`);
    return res.data;
  } catch (e) {
    return thunk.rejectWithValue(e.response?.data?.message || 'Failed to load admin stats');
  }
});

export const fetchHRStats = createAsyncThunk('analytics/fetchHR', async (_, thunk) => {
  try {
    const res = await api.get(`${API_URL}/hr`);
    return res.data;
  } catch (e) {
    return thunk.rejectWithValue(e.response?.data?.message || 'Failed to load HR stats');
  }
});

export const fetchSalesStats = createAsyncThunk('analytics/fetchSales', async (_, thunk) => {
  try {
    const res = await api.get(`${API_URL}/sales`);
    return res.data;
  } catch (e) {
    return thunk.rejectWithValue(e.response?.data?.message || 'Failed to load sales stats');
  }
});

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    adminStats: null,
    hrStats: null,
    salesStats: null,
    loading: false,
    error: null
  },
  reducers: {
    clearAnalytics: (state) => {
      state.adminStats = null;
      state.hrStats = null;
      state.salesStats = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Admin Stats
      .addCase(fetchAdminStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.loading = false;
        state.adminStats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Keep adminStats null so the dashboard shows loading/error UI
      })

      // HR Stats
      .addCase(fetchHRStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHRStats.fulfilled, (state, action) => {
        state.loading = false;
        state.hrStats = action.payload;
      })
      .addCase(fetchHRStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Provide safe defaults so HRDashboard doesn't crash with null destructuring
        state.hrStats = {
          headcountByDept: [],
          attendanceSummary: [],
          upcomingBirthdays: [],
          pendingLeaves: 0,
          totalEmployees: 0,
          recentLeaves: []
        };
      })

      // Sales Stats
      .addCase(fetchSalesStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesStats.fulfilled, (state, action) => {
        state.loading = false;
        state.salesStats = action.payload;
      })
      .addCase(fetchSalesStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Provide safe defaults so SalesDashboard doesn't crash
        state.salesStats = {
          myLeadsCount: 0,
          myPipeline: [],
          wonThisMonth: 0,
          wonDealsCount: 0,
          totalPipelineValue: 0
        };
      });
  }
});

export const { clearAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;
