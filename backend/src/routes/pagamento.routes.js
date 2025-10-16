const express = require('express');
const router = express.Router();

const PagamentoController = require('../controllers/PagamentoController');
const { verifyToken } = require('../middlewares/auth');

// Routes
router.post('/:booking_id/create', verifyToken, PagamentoController.create);
router.get('/:booking_id', verifyToken, PagamentoController.getStatus);
router.post('/webhook', PagamentoController.webhook); // No auth for webhook

module.exports = router;