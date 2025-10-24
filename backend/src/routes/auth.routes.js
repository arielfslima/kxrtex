import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validator.js';
import { registerSchema, loginSchema } from '../utils/validation.js';
import { authenticate } from '../middlewares/auth.js';
import { authLimiter } from '../config/rateLimiter.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.get('/me', authenticate, getMe);

export default router;
