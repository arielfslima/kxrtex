import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';
import {
  createPaymentSchema,
  refundRequestSchema
} from '../utils/validation.js';
import {
  createBookingPayment,
  getPayment,
  handleWebhook,
  requestRefund,
  releasePayment,
  simulatePaymentConfirmation
} from '../controllers/payment.controller.js';

const router = Router();

// Webhook público (sem autenticação)
router.post('/webhook', handleWebhook);

// Rotas protegidas
router.use(authenticate);

router.post('/booking/:bookingId', validate(createPaymentSchema), createBookingPayment);

router.get('/booking/:bookingId', getPayment);

router.post('/booking/:bookingId/refund', validate(refundRequestSchema), requestRefund);

router.post('/booking/:bookingId/release', releasePayment);

// TESTE: Simular confirmação de pagamento (REMOVER EM PRODUÇÃO)
router.post('/booking/:bookingId/simulate-confirm', simulatePaymentConfirmation);

export default router;
