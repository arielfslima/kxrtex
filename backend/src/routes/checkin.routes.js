import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { uploadSingle } from '../middlewares/upload.js';
import { validate } from '../middlewares/validator.js';
import { checkInSchema, checkOutSchema } from '../utils/validation.js';
import {
  checkIn,
  checkOut,
  getCheckInStatus,
  validarCheckIn,
  confirmarInicioEvento,
  finalizarEvento
} from '../controllers/checkin.controller.v2.js';

const router = Router();

router.use(authenticate);

router.post('/booking/:bookingId/checkin', uploadSingle, validate(checkInSchema), checkIn);

router.post('/booking/:bookingId/checkout', validate(checkOutSchema), checkOut); // DEPRECADO

router.post('/booking/:bookingId/validar', validarCheckIn);

router.post('/booking/:bookingId/confirmar-inicio', confirmarInicioEvento);

router.post('/booking/:bookingId/finalizar', finalizarEvento);

router.get('/booking/:bookingId/status', getCheckInStatus);

export default router;
