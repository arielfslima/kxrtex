import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Configs
import { rateLimiter } from './config/rateLimiter.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { setSocketInstance } from './utils/socket.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import artistRoutes from './routes/artist.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import reviewRoutes from './routes/review.routes.js';
import chatRoutes from './routes/chat.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import checkinRoutes from './routes/checkin.routes.js';
import adiantamentoRoutes from './routes/adiantamento.routes.js';
import adminRoutes from './routes/admin.routes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['*'];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Set socket instance for controllers
setSocketInstance(io);

// Middlewares
app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/adiantamentos', adiantamentoRoutes);
app.use('/api/admin', adminRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-booking', (bookingId) => {
    socket.join(`booking-${bookingId}`);
    console.log(`Socket ${socket.id} joined booking-${bookingId}`);

    socket.to(`booking-${bookingId}`).emit('user-joined', {
      socketId: socket.id,
      timestamp: new Date()
    });
  });

  socket.on('leave-booking', (bookingId) => {
    socket.leave(`booking-${bookingId}`);
    console.log(`Socket ${socket.id} left booking-${bookingId}`);

    socket.to(`booking-${bookingId}`).emit('user-left', {
      socketId: socket.id,
      timestamp: new Date()
    });
  });

  socket.on('typing', (data) => {
    socket.to(`booking-${data.bookingId}`).emit('user-typing', {
      userId: data.userId,
      nome: data.nome
    });
  });

  socket.on('stop-typing', (data) => {
    socket.to(`booking-${data.bookingId}`).emit('user-stop-typing', {
      userId: data.userId
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling (deve ser o último middleware)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║                                       ║
║   🎵 KXRTEX API Server Running 🎵    ║
║                                       ║
║   Environment: ${process.env.NODE_ENV?.padEnd(24) || 'development'.padEnd(24)}║
║   Port: ${String(PORT).padEnd(30)}║
║   Time: ${new Date().toLocaleTimeString().padEnd(30)}║
║                                       ║
╚═══════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export { io };
