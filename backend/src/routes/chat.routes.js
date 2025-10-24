import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { validate, validateQuery } from '../middlewares/validator.js';
import {
  sendMessageSchema,
  getMessagesQuerySchema
} from '../utils/validation.js';
import {
  sendMessage,
  getMessages
} from '../controllers/chat.controller.js';

const router = Router();

router.use(authenticate);

router.post('/booking/:bookingId', validate(sendMessageSchema), sendMessage);

router.get('/booking/:bookingId', validateQuery(getMessagesQuerySchema), getMessages);

export default router;
