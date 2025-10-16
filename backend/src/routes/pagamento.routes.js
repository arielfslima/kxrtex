const express = require('express');
const router = express.Router();

const PagamentoController = require('../controllers/PagamentoController');
const { verifyToken } = require('../middlewares/auth');
const {
  handleValidationErrors,
  sanitizeInput,
  requireContractor
} = require('../middlewares/validation');
const { paymentAttemptThrottle } = require('../middlewares/actionThrottling');
const {
  createPaymentValidation,
  getPaymentStatusValidation,
  webhookValidation
} = require('../validators/paymentValidators');

// Routes
router.post('/:booking_id',
  verifyToken,
  requireContractor,
  paymentAttemptThrottle,
  sanitizeInput,
  createPaymentValidation,
  handleValidationErrors,
  PagamentoController.create
);

router.get('/:booking_id/status',
  verifyToken,
  getPaymentStatusValidation,
  handleValidationErrors,
  PagamentoController.getStatus
);

// Webhook - no auth required but validate payload
router.post('/webhook',
  sanitizeInput,
  webhookValidation,
  handleValidationErrors,
  PagamentoController.webhook
);

module.exports = router;