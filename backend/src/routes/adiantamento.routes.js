import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import {
  checkEligibility,
  requestAdvance,
  getAdvance,
  confirmCheckin
} from '../controllers/adiantamento.controller.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/adiantamentos/:bookingId/eligibility - Check if booking is eligible for advance
router.get('/:bookingId/eligibility', checkEligibility);

// POST /api/adiantamentos/:bookingId - Request advance payment
router.post('/:bookingId', requestAdvance);

// GET /api/adiantamentos/:bookingId - Get advance details
router.get('/:bookingId', getAdvance);

// POST /api/adiantamentos/:bookingId/checkin - Confirm check-in to release advance
router.post('/:bookingId/checkin', confirmCheckin);

export default router;
