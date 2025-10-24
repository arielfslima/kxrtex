import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { validate, validateQuery } from '../middlewares/validator.js';
import {
  createBookingSchema,
  listBookingsQuerySchema,
  rejectBookingSchema,
  counterOfferSchema
} from '../utils/validation.js';
import {
  createBooking,
  listBookings,
  getBookingById,
  acceptBooking,
  rejectBooking,
  counterOffer
} from '../controllers/booking.controller.js';

const router = Router();

// Todas as rotas de booking precisam de autenticação
router.use(authenticate);

router.get('/', validateQuery(listBookingsQuerySchema), listBookings);

router.post('/', validate(createBookingSchema), createBooking);

router.get('/:id', getBookingById);

router.patch('/:id/accept', acceptBooking);

router.patch('/:id/reject', validate(rejectBookingSchema), rejectBooking);

router.post('/:id/counter-offer', validate(counterOfferSchema), counterOffer);

export default router;
