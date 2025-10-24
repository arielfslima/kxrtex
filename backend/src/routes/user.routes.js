import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

// Rotas protegidas - precisam de autenticação
router.use(authenticate);

// Placeholder: será implementado na próxima fase
router.get('/profile', (req, res) => {
  res.json({ message: 'User profile route - to be implemented' });
});

router.patch('/profile', (req, res) => {
  res.json({ message: 'Update profile route - to be implemented' });
});

export default router;
