import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user || !user.token) return;

    this.socket = io(API_URL, {
      auth: { token: user.token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on('connect', () => {
      console.log('Socket protocol established');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket protocol terminated');
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket protocol error:', err.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }
}

const socketService = new SocketService();
export default socketService;
