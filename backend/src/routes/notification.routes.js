import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import {
  saveDeviceToken,
  removeDeviceToken,
  getUserTokens,
} from '../controllers/notification.controller.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// POST /api/notifications/token - Salvar/atualizar token do dispositivo
router.post('/token', saveDeviceToken);

// DELETE /api/notifications/token - Remover token do dispositivo (logout)
router.delete('/token', removeDeviceToken);

// GET /api/notifications/tokens - Listar tokens do usuário (para debug)
router.get('/tokens', getUserTokens);

export default router;
