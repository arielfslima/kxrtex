import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';
import { updateUserProfileSchema } from '../utils/validation.js';
import { getUserProfile, updateUserProfile } from '../controllers/user.controller.js';

const router = Router();

// Rotas protegidas - precisam de autenticação
router.use(authenticate);

router.get('/profile', getUserProfile);

router.patch('/profile', validate(updateUserProfileSchema), updateUserProfile);

export default router;
