const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { cache } = require('../config/redis');

const socketHandler = (io) => {
  // Authentication middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if token is blacklisted
      const blacklisted = await cache.exists(`blacklist_${token}`);
      if (blacklisted) {
        return next(new Error('Authentication error: Invalid token'));
      }

      // Attach user to socket
      socket.userId = decoded.id;
      socket.userType = decoded.tipo;
      socket.user = decoded;

      // Store socket connection in Redis
      await cache.set(`socket_${decoded.id}`, socket.id, 86400); // 24 hours

      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error: ' + error.message));
    }
  });

  io.on('connection', async (socket) => {
    logger.info(`User ${socket.userId} connected via socket ${socket.id}`);

    // Join user's personal room
    socket.join(`user_${socket.userId}`);

    // Update user online status
    await cache.set(`online_${socket.userId}`, true, 86400);

    // Join booking rooms for active conversations
    socket.on('join:booking', async (bookingId) => {
      try {
        // TODO: Verify user has access to this booking
        socket.join(`booking_${bookingId}`);
        logger.info(`User ${socket.userId} joined booking room ${bookingId}`);

        // Emit join confirmation
        socket.emit('joined:booking', {
          bookingId,
          message: 'Successfully joined booking room'
        });
      } catch (error) {
        logger.error('Error joining booking room:', error);
        socket.emit('error', {
          message: 'Failed to join booking room'
        });
      }
    });

    // Leave booking room
    socket.on('leave:booking', (bookingId) => {
      socket.leave(`booking_${bookingId}`);
      logger.info(`User ${socket.userId} left booking room ${bookingId}`);
    });

    // Handle sending messages
    socket.on('message:send', async (data) => {
      try {
        const { bookingId, message, tipo } = data;

        // TODO: Validate and save message to database
        const savedMessage = {
          id: 'temp_' + Date.now(),
          booking_id: bookingId,
          remetente_id: socket.userId,
          mensagem: message,
          tipo: tipo || 'texto',
          lida: false,
          criado_em: new Date().toISOString()
        };

        // Emit message to all users in the booking room
        io.to(`booking_${bookingId}`).emit('message:received', savedMessage);

        // Send push notification to offline user
        // TODO: Implement push notification

        logger.info(`Message sent from ${socket.userId} to booking ${bookingId}`);
      } catch (error) {
        logger.error('Error sending message:', error);
        socket.emit('error', {
          message: 'Failed to send message'
        });
      }
    });

    // Handle typing indicators
    socket.on('typing:start', (data) => {
      const { bookingId } = data;
      socket.to(`booking_${bookingId}`).emit('typing:started', {
        userId: socket.userId,
        bookingId
      });
    });

    socket.on('typing:stop', (data) => {
      const { bookingId } = data;
      socket.to(`booking_${bookingId}`).emit('typing:stopped', {
        userId: socket.userId,
        bookingId
      });
    });

    // Handle message read status
    socket.on('message:read', async (data) => {
      try {
        const { messageId, bookingId } = data;

        // TODO: Update message as read in database

        // Notify sender that message was read
        io.to(`booking_${bookingId}`).emit('message:read:update', {
          messageId,
          readBy: socket.userId,
          readAt: new Date().toISOString()
        });
      } catch (error) {
        logger.error('Error marking message as read:', error);
      }
    });

    // Handle real-time notifications
    socket.on('notification:mark-read', async (notificationId) => {
      try {
        // TODO: Mark notification as read in database
        logger.info(`Notification ${notificationId} marked as read by ${socket.userId}`);
      } catch (error) {
        logger.error('Error marking notification as read:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      logger.info(`User ${socket.userId} disconnected`);

      // Update user offline status
      await cache.del(`online_${socket.userId}`);
      await cache.del(`socket_${socket.userId}`);

      // Notify other users about offline status
      io.emit('user:offline', { userId: socket.userId });
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for user ${socket.userId}:`, error);
    });
  });

  // Helper function to send notification to specific user
  io.sendNotification = async (userId, notification) => {
    const socketId = await cache.get(`socket_${userId}`);
    if (socketId) {
      io.to(socketId).emit('notification:new', notification);
    }
  };

  // Helper function to send message to booking room
  io.sendToBooking = (bookingId, event, data) => {
    io.to(`booking_${bookingId}`).emit(event, data);
  };

  // Helper function to check if user is online
  io.isUserOnline = async (userId) => {
    const online = await cache.get(`online_${userId}`);
    return !!online;
  };

  return io;
};

module.exports = socketHandler;