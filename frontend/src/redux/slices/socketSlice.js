import { createSlice } from '@reduxjs/toolkit';

const socketSlice = createSlice({
  name: 'socket',
  initialState: {
    isConnected: false,
    onlineUsers: [],
    onlineCount: 0
  },
  reducers: {
    setConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    setOnlineUsers: (state, action) => {
      // action.payload should be an array of [userId, data] entries
      state.onlineUsers = action.payload.map(([id, data]) => ({ id, ...data }));
    },
    updateOnlineCount: (state, action) => {
      state.onlineCount = action.payload;
    },
    handleUserOnline: (state, action) => {
      const { userId, name, role } = action.payload;
      if (!state.onlineUsers.find(u => u.id === userId)) {
        state.onlineUsers.push({ id: userId, name, role });
      }
    },
    handleUserOffline: (state, action) => {
      state.onlineUsers = state.onlineUsers.filter(u => u.id !== action.payload.userId);
    }
  }
});

export const { 
  setConnected, 
  setOnlineUsers, 
  updateOnlineCount, 
  handleUserOnline, 
  handleUserOffline 
} = socketSlice.actions;

export default socketSlice.reducer;
