import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const API_URL = '/api/notifications';
const getAuth = () => ({ headers: { Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('user')).token}` } });

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (params = {}, thunk) => {
  try {
    const { page = 1, module, type, priority } = params;
    let url = `${API_URL}?page=${page}`;
    if (module) url += `&module=${module}`;
    if (type) url += `&type=${type}`;
    if (priority) url += `&priority=${priority}`;
    
    return (await api.get(url, getAuth())).data;
  } catch (e) {
    return thunk.rejectWithValue(e.response.data.message);
  }
});

export const fetchUnreadCount = createAsyncThunk('notifications/count', async (_, thunk) => {
  try { return (await api.get(`${API_URL}/count`, getAuth())).data; } 
  catch (e) { return thunk.rejectWithValue(e.response.data.message); }
});

export const markAsRead = createAsyncThunk('notifications/markRead', async (id, thunk) => {
  try { return (await api.put(`${API_URL}/${id}/read`, {}, getAuth())).data; } 
  catch (e) { return thunk.rejectWithValue(e.response.data.message); }
});

export const markAllAsRead = createAsyncThunk('notifications/markAllRead', async (_, thunk) => {
  try { return (await api.put(`${API_URL}/read-all`, {}, getAuth())).data; } 
  catch (e) { return thunk.rejectWithValue(e.response.data.message); }
});

export const clearNotifications = createAsyncThunk('notifications/clear', async (_, thunk) => {
  try { return (await api.delete(API_URL + '/clear', getAuth())).data; } 
  catch (e) { return thunk.rejectWithValue(e.response.data.message); }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { 
    notifications: [], 
    pagination: { totalPages: 1, currentPage: 1, totalItems: 0 },
    unreadCount: 0, 
    loading: false, 
    error: null 
  },
  reducers: {
    addNotification: (state, action) => {
      const exists = state.notifications.some(n => n._id === action.payload._id);
      if (!exists) {
        state.notifications.unshift(action.payload);
        if (!action.payload.isRead) state.unreadCount += 1;
      }
    },
    updateNotification: (state, action) => {
      const index = state.notifications.findIndex(n => n._id === action.payload._id || n.groupId === action.payload.groupId);
      if (index !== -1) {
        state.notifications[index] = { ...state.notifications[index], ...action.payload };
      } else {
        state.notifications.unshift(action.payload);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => { 
        state.loading = false;
        state.notifications = action.payload.notifications; 
        state.pagination = {
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          totalItems: action.payload.totalItems
        };
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => { state.unreadCount = action.payload.count; })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n._id === action.payload._id);
        if (index !== -1 && !state.notifications[index].isRead) {
          state.notifications[index].isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
        state.unreadCount = 0;
      })
      .addCase(clearNotifications.fulfilled, (state) => {
        state.notifications = [];
        state.unreadCount = 0;
      });
  }
});

export const { addNotification, updateNotification } = notificationSlice.actions;
export default notificationSlice.reducer;

