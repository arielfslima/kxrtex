const express = require('express');
const router = express.Router();

const NotificacaoController = require('../controllers/NotificacaoController');
const { verifyToken } = require('../middlewares/auth');

// Routes
router.get('/', verifyToken, NotificacaoController.list);
router.put('/:id/read', verifyToken, NotificacaoController.markAsRead);
router.put('/read-all', verifyToken, NotificacaoController.markAllAsRead);

module.exports = router;