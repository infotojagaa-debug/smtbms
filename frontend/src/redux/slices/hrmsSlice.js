import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  employees: [],
  attendance: [],
  leaves: [],
  payroll: [],
  stats: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

const getAuthHeader = () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  return user ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
};

// Payroll Thunks
export const generatePayroll = createAsyncThunk('hrms/generatePayroll', async (data, thunkAPI) => {
  try {
    const response = await axios.post('/api/payroll/generate', data, getAuthHeader());
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const fetchPayroll = createAsyncThunk('hrms/fetchPayroll', async (_, thunkAPI) => {
  try {
    const response = await axios.get('/api/payroll', getAuthHeader());
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const markPaid = createAsyncThunk('hrms/markPaid', async (id, thunkAPI) => {
  try {
    const response = await axios.patch(`/api/payroll/${id}/pay`, {}, getAuthHeader());
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Attendance Thunks
export const checkIn = createAsyncThunk('hrms/checkIn', async (_, thunkAPI) => {
  try {
    const response = await axios.post('/api/attendance/check-in', {}, getAuthHeader());
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const checkOut = createAsyncThunk('hrms/checkOut', async (_, thunkAPI) => {
  try {
    const response = await axios.post('/api/attendance/check-out', {}, getAuthHeader());
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const fetchMyAttendance = createAsyncThunk('hrms/fetchMyAttendance', async (_, thunkAPI) => {
  try {
    const response = await axios.get('/api/hr/attendance/my/monthly', getAuthHeader());
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const hrmsSlice = createSlice({
  name: 'hrms',
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
      .addCase(fetchPayroll.fulfilled, (state, action) => {
        state.payroll = action.payload;
      })
      .addCase(generatePayroll.pending, (state) => { state.isLoading = true; })
      .addCase(generatePayroll.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(fetchMyAttendance.fulfilled, (state, action) => {
        state.attendance = action.payload;
      })
      .addCase(checkIn.fulfilled, (state, action) => {
        state.attendance = [action.payload, ...state.attendance];
      })
      .addCase(checkOut.fulfilled, (state, action) => {
        state.attendance = state.attendance.map(a => a._id === action.payload._id ? action.payload : a);
      });
  },
});

export const { reset } = hrmsSlice.actions;
export default hrmsSlice.reducer;
