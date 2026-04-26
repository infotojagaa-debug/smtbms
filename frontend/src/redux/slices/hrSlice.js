import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/hr';

const getAuthHeader = () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  return user ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
};

// Employees
export const fetchEmployees = createAsyncThunk('hr/fetchEmployees', async (params, thunkAPI) => {
  try {
    const response = await axios.get(`${API_URL}/employees`, { 
      ...getAuthHeader(),
      params 
    });
    return response.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response.data.message);
  }
});

export const createEmployee = createAsyncThunk('hr/createEmployee', async (data, thunkAPI) => {
  try {
    const response = await axios.post(`${API_URL}/employees`, data, getAuthHeader());
    return response.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response.data.message);
  }
});

// Attendance
export const markCheckIn = createAsyncThunk('hr/checkIn', async (_, thunkAPI) => {
  try {
    const response = await axios.post(`${API_URL}/attendance/checkin`, {}, getAuthHeader());
    return response.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response.data.message);
  }
});

export const markCheckOut = createAsyncThunk('hr/checkOut', async (_, thunkAPI) => {
  try {
    const response = await axios.post(`${API_URL}/attendance/checkout`, {}, getAuthHeader());
    return response.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response.data.message);
  }
});

// Leaves
export const fetchLeaves = createAsyncThunk('hr/fetchLeaves', async (_, thunkAPI) => {
  try {
    const response = await axios.get(`${API_URL}/leaves?my=true`, getAuthHeader());
    return response.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response.data.message);
  }
});

export const applyLeave = createAsyncThunk('hr/applyLeave', async (data, thunkAPI) => {
  try {
    const response = await axios.post(`${API_URL}/leaves`, data, getAuthHeader());
    return response.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response.data.message);
  }
});

export const fetchMyBalance = createAsyncThunk('hr/fetchMyBalance', async (_, thunkAPI) => {
  try {
    // We'll use a special endpoint /my-balance or just /balance/:id
    const user = JSON.parse(sessionStorage.getItem('user'));
    // Since we don't have the employeeId directly in user object always, 
    // the backend /api/hr/leaves/balance/my should handle it via token.
    const response = await axios.get(`${API_URL}/leaves/balance/my`, getAuthHeader());
    return response.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response.data.message);
  }
});

// Payroll
export const generatePayroll = createAsyncThunk('hr/generatePayroll', async (data, thunkAPI) => {
  try {
    const response = await axios.post(`${API_URL}/payroll/generate`, data, getAuthHeader());
    return response.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response.data.message);
  }
});

const initialState = {
  employees: [],
  selectedEmployee: null,
  attendance: [],
  leaves: [],
  leaveBalance: null,
  payroll: [],
  performance: [],
  stats: null,
  loading: false,
  error: null,
  isSuccess: false,
};

export const hrSlice = createSlice({
  name: 'hr',
  initialState,
  reducers: {
    resethr: (state) => {
      state.loading = false;
      state.error = null;
      state.isSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => { state.loading = true; })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload.employees;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(createEmployee.fulfilled, (state) => {
        state.isSuccess = true;
      })
      .addCase(fetchLeaves.fulfilled, (state, action) => {
        state.leaves = action.payload;
      })
      .addCase(applyLeave.fulfilled, (state, action) => {
        state.leaves = [action.payload, ...state.leaves];
        state.isSuccess = true;
      })
      .addCase(fetchMyBalance.fulfilled, (state, action) => {
        state.leaveBalance = action.payload;
      });
  }
});

export const { resethr } = hrSlice.actions;
export default hrSlice.reducer;
