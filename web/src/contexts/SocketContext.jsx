import { createContext, useContext, useEffect, useState } from 'react';
import { initializeSocket, disconnectSocket, getSocket, subscribeToBookingEvents } from '../services/socket';
import useAuthStore from '../store/authStore';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const socket = initializeSocket(user.id);

      socket.on('connect', () => {
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      const unsubscribe = subscribeToBookingEvents({
        onNewBookingRequest: (data) => {
          console.log('New booking request:', data);
          addNotification({
            type: 'new-booking-request',
            title: 'Nova Proposta de Booking',
            message: `${data.contratante.nome} enviou uma proposta de booking`,
            data,
          });
        },
        onBookingAccepted: (data) => {
          console.log('Booking accepted:', data);
          addNotification({
            type: 'booking-accepted',
            title: 'Booking Aceito',
            message: `${data.artista.nome} aceitou seu booking!`,
            data,
          });
        },
      });

      return () => {
        unsubscribe();
        disconnectSocket();
        setIsConnected(false);
      };
    }
  }, [isAuthenticated, user?.id]);

  const addNotification = (notification) => {
    setNotifications((prev) => [
      { ...notification, id: Date.now(), timestamp: new Date() },
      ...prev,
    ]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const value = {
    socket: getSocket(),
    isConnected,
    notifications,
    clearNotifications,
    removeNotification,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
