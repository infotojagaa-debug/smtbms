import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const initialState = {
  materials: [],
  selectedMaterial: null,
  movementHistory: [],
  totalPages: 1,
  currentPage: 1,
  totalItems: 0,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};



export const fetchMaterials = createAsyncThunk('material/getAll', async (query = {}, thunkAPI) => {
  try {
    const { page = 1, search = '', category = '', department = '', stockStatus = '' } = query;
    const queryString = `?page=${page}&search=${search}&category=${category}&department=${department}&stockStatus=${stockStatus}`;
    const response = await api.get(`/api/materials${queryString}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const fetchMaterialById = createAsyncThunk('material/getOne', async (id, thunkAPI) => {
  try {
    const response = await api.get(`/api/materials/${id}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const fetchHistory = createAsyncThunk('material/getHistory', async (id, thunkAPI) => {
  try {
    const response = await api.get(`/api/materials/history/${id}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const createMaterial = createAsyncThunk('material/create', async (materialData, thunkAPI) => {
  try {
    const response = await api.post('/api/materials', materialData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const transferMaterial = createAsyncThunk('material/transfer', async (transferData, thunkAPI) => {
  try {
    const response = await api.post('/api/materials/transfer', transferData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const sendManualAlert = createAsyncThunk('material/sendAlert', async (materialId, thunkAPI) => {
  try {
    const response = await api.post('/api/materials/low-stock/alert', { materialId });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const deleteMaterial = createAsyncThunk('material/delete', async (id, thunkAPI) => {
  try {
    const response = await api.delete(`/api/materials/${id}`);
    return { id, message: response.data.message };
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const materialSlice = createSlice({
  name: 'material',
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
      .addCase(fetchMaterials.pending, (state) => { state.isLoading = true; })
      .addCase(fetchMaterials.fulfilled, (state, action) => {
        state.isLoading = false;
        state.materials = action.payload.materials;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.totalItems = action.payload.totalItems;
      })
      .addCase(fetchMaterialById.fulfilled, (state, action) => {
        state.selectedMaterial = action.payload;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.movementHistory = action.payload;
      })
      .addCase(createMaterial.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(transferMaterial.fulfilled, (state) => {
        state.isSuccess = true;
      })
      .addCase(deleteMaterial.fulfilled, (state, action) => {
        state.materials = state.materials.filter(m => m._id !== action.payload.id);
      });
  },
});

export const { reset } = materialSlice.actions;
export default materialSlice.reducer;
