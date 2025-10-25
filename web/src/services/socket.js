import { io } from 'socket.io-client';

let socket = null;

export const initializeSocket = (userId) => {
  if (socket) {
    socket.disconnect();
  }

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('Socket.IO connected:', socket.id);
    if (userId) {
      socket.emit('join', `user-${userId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket.IO disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket.IO connection error:', error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => {
  return socket;
};

export const subscribeToBookingEvents = (callbacks) => {
  if (!socket) return;

  if (callbacks.onNewBookingRequest) {
    socket.on('new-booking-request', callbacks.onNewBookingRequest);
  }

  if (callbacks.onBookingAccepted) {
    socket.on('booking-accepted', callbacks.onBookingAccepted);
  }

  if (callbacks.onBookingStatusUpdate) {
    socket.on('booking-status-update', callbacks.onBookingStatusUpdate);
  }

  return () => {
    socket.off('new-booking-request');
    socket.off('booking-accepted');
    socket.off('booking-status-update');
  };
};
