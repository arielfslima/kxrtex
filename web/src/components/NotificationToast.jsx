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
        return 'NEW';
      case 'booking-accepted':
        return 'OK';
      default:
        return '!';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'new-booking-request':
        return 'text-neon-acid';
      case 'booking-accepted':
        return 'text-neon-acid';
      default:
        return 'text-neon-pink';
    }
  };

  return (
    <div className="fixed top-20 right-6 z-50 animate-slide-in-right">
      <div
        onClick={handleClick}
        className="group relative bg-dark-800 border-2 border-neon-red p-4 shadow-brutal cursor-pointer hover:shadow-brutal-acid transition-all max-w-sm"
      >
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-neon-acid"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-neon-acid"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-neon-acid"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-neon-acid"></div>

        <div className="relative flex gap-4">
          <div className={`text-2xl font-display ${getIconColor(notification.type)}`}>
            {getIcon(notification.type)}
          </div>
          <div className="flex-1">
            <div className="text-chrome font-display tracking-wider uppercase mb-1">{notification.title}</div>
            <div className="text-chrome/70 font-mono text-xs mb-2 uppercase">{notification.message}</div>
            <div className="text-chrome/30 font-mono text-xs uppercase">
              {notification.timestamp.toLocaleTimeString('pt-BR')}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeNotification(notification.id);
            }}
            className="text-chrome/50 hover:text-neon-red transition-colors font-display text-xl"
          >
            X
          </button>
        </div>
      </div>
    </div>
  );
}
