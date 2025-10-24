import express from 'express';
import {
  getDashboard,
  getUsuarios,
  updateUsuarioStatus,
  verificarArtista,
  getBookings,
  getInfracoes,
} from '../controllers/admin.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/requireAdmin.js';

const router = express.Router();

// Todas as rotas admin requerem autenticação + permissão de admin
router.use(authenticate);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', getDashboard);

// Gestão de Usuários
router.get('/usuarios', getUsuarios);
router.put('/usuarios/:id/status', updateUsuarioStatus);

// Gestão de Artistas
router.put('/artistas/:id/verificar', verificarArtista);

// Gestão de Bookings
router.get('/bookings', getBookings);

// Gestão de Infrações
router.get('/infracoes', getInfracoes);

export default router;
