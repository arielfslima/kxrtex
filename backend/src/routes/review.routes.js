import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { validate, validateQuery } from '../middlewares/validator.js';
import {
  createReviewSchema,
  listReviewsQuerySchema
} from '../utils/validation.js';
import {
  createReview,
  listReviews,
  getBookingReviews
} from '../controllers/review.controller.js';

const router = Router();

router.use(authenticate);

router.post('/booking/:bookingId', validate(createReviewSchema), createReview);

router.get('/artist/:artistaId', validateQuery(listReviewsQuerySchema), listReviews);

router.get('/booking/:bookingId', getBookingReviews);

export default router;
