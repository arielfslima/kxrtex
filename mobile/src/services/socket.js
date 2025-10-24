import io from 'socket.io-client';
import { API_CONFIG } from '../constants/api';

class SocketService {
  socket = null;
  connected = false;

  connect(token) {
    if (this.socket?.connected) {
      return;
    }

    const SOCKET_URL = API_CONFIG.BASE_URL.replace('/api', '');

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Socket.IO connected');
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      this.connected = false;
    });

    this.socket.on('error', (error) => {
      console.error('Socket.IO error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Chat events
  joinBooking(bookingId) {
    if (this.socket) {
      this.socket.emit('join-booking', bookingId);
    }
  }

  leaveBooking(bookingId) {
    if (this.socket) {
      this.socket.emit('leave-booking', bookingId);
    }
  }

  sendMessage(bookingId, conteudo) {
    if (this.socket) {
      this.socket.emit('send-message', { bookingId, conteudo });
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  offNewMessage() {
    if (this.socket) {
      this.socket.off('new-message');
    }
  }

  startTyping(bookingId, userId, nome) {
    if (this.socket) {
      this.socket.emit('typing', { bookingId, userId, nome });
    }
  }

  stopTyping(bookingId, userId) {
    if (this.socket) {
      this.socket.emit('stop-typing', { bookingId, userId });
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user-typing', callback);
    }
  }

  offUserTyping() {
    if (this.socket) {
      this.socket.off('user-typing');
    }
  }

  onUserStopTyping(callback) {
    if (this.socket) {
      this.socket.on('user-stop-typing', callback);
    }
  }

  offUserStopTyping() {
    if (this.socket) {
      this.socket.off('user-stop-typing');
    }
  }

  isConnected() {
    return this.connected && this.socket?.connected;
  }
}

export default new SocketService();
