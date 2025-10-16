require('dotenv').config();
require('express-async-errors');

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { Server } = require('socket.io');

const database = require('./config/database');
const redisClient = require('./config/redis');
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');
const rateLimiter = require('./middlewares/rateLimiter');
const socketHandler = require('./sockets');

const routes = require('./routes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
}

// Rate limiting
app.use('/api/', rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api', routes);

// Socket.IO
const socketIO = socketHandler(io);

// Make io available globally for services
global.io = socketIO;

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint não encontrado'
    }
  });
});

// Database connection and server startup
const PORT = process.env.PORT || 3333;

const startServer = async () => {
  try {
    // Test database connection
    await database.authenticate();
    logger.info('✅ Database conectado com sucesso');

    // Test Redis connection
    await redisClient.ping();
    logger.info('✅ Redis conectado com sucesso');

    // Sync database models (only in development)
    if (process.env.NODE_ENV === 'development') {
      await database.sync({ alter: true });
      logger.info('✅ Database sincronizado');
    }

    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 Servidor KXRTEX rodando na porta ${PORT}`);
      logger.info(`🔗 http://localhost:${PORT}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM recebido. Encerrando servidor...');

  server.close(() => {
    logger.info('Servidor HTTP encerrado');
  });

  try {
    await database.close();
    logger.info('Conexão com database encerrada');

    await redisClient.quit();
    logger.info('Conexão com Redis encerrada');

    process.exit(0);
  } catch (error) {
    logger.error('Erro durante shutdown:', error);
    process.exit(1);
  }
});

module.exports = { app, server, io };