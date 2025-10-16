const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const profissionalRoutes = require('./profissional.routes');
const portfolioRoutes = require('./portfolio.routes');
const bookingRoutes = require('./booking.routes');
const mensagemRoutes = require('./mensagem.routes');
const pagamentoRoutes = require('./pagamento.routes');
const avaliacaoRoutes = require('./avaliacao.routes');
const notificacaoRoutes = require('./notificacoes');

// API info
router.get('/', (req, res) => {
  res.json({
    name: 'KXRTEX API',
    version: '1.0.0',
    description: 'Plataforma de booking para artistas underground',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      profissionais: '/api/profissionais',
      portfolio: '/api/portfolio',
      bookings: '/api/bookings',
      mensagens: '/api/mensagens',
      pagamentos: '/api/pagamentos',
      avaliacoes: '/api/avaliacoes',
      notificacoes: '/api/notificacoes'
    }
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/profissionais', profissionalRoutes);
router.use('/portfolio', portfolioRoutes);
router.use('/bookings', bookingRoutes);
router.use('/mensagens', mensagemRoutes);
router.use('/pagamentos', pagamentoRoutes);
router.use('/avaliacoes', avaliacaoRoutes);
router.use('/notificacoes', notificacaoRoutes);

module.exports = router;