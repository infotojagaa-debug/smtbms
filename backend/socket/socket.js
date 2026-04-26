const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;
const onlineUsers = new Map(); // userId -> { socketId, name, role, dept }

const initialiseSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Adjust in production
      methods: ["GET", "POST"]
    }
  });

  // Socket Auth Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication Error: Token missing'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('Authentication Error: User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication Error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { _id, name, role, department } = socket.user;
    const userId = _id.toString();

    // 1. Join Universal & Role-based Rooms
    socket.join(`user_${userId}`);
    socket.join(`role_${role}`);
    if (department) {
      socket.join(`dept_${department}`);
    }
    if (role === 'Admin') {
      socket.join('admin');
    }

    // 2. Track Online Status
    onlineUsers.set(userId, { 
      socketId: socket.id, 
      name, 
      role, 
      department,
      lastActive: new Date()
    });

    // Broadcast online status
    io.emit('user:online', { userId, name, role });
    io.emit('system:online_count', onlineUsers.size);

    console.log(`Socket [${socket.id}] authenticated as User [${name}]`);

    // 3. Handlers
    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('user:offline', { userId, name });
      io.emit('system:online_count', onlineUsers.size);
      console.log(`User [${name}] disconnected`);
    });

    socket.on('get_online_users', () => {
       socket.emit('online_users_list', Array.from(onlineUsers.entries()));
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    // console.warn('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initialiseSocket, getIO };
