import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';

export default function NotificationToast() {
  const navigate = useNavigate();
  const { notifications, removeNotification } = useSocket();

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        removeNotification(notifications[0].id);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notifications, removeNotification]);

  if (notifications.length === 0) return null;

  const notification = notifications[0];

  const handleClick = () => {
    if (notification.data?.bookingId) {
      navigate(`/bookings/${notification.data.bookingId}`);
    }
    removeNotification(notification.id);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'new-booking-request':
        return '📅';
      case 'booking-accepted':
        return '✅';
      default:
        return '🔔';
    }
  };

  return (
    <div className="fixed top-20 right-6 z-50 animate-slide-in-right">
      <div
        onClick={handleClick}
        className="group relative bg-dark-800 border-2 border-red-vibrant rounded-2xl p-4 shadow-2xl shadow-red-vibrant/30 cursor-pointer hover:scale-105 transition-all max-w-sm"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-vibrant/10 to-pink-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

        <div className="relative flex gap-4">
          <div className="text-4xl">{getIcon(notification.type)}</div>
          <div className="flex-1">
            <div className="text-white font-bold mb-1">{notification.title}</div>
            <div className="text-gray-300 text-sm mb-2">{notification.message}</div>
            <div className="text-gray-500 text-xs">
              {notification.timestamp.toLocaleTimeString('pt-BR')}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeNotification(notification.id);
            }}
            className="text-gray-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
