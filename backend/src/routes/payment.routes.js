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
  releasePayment
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

export default router;
