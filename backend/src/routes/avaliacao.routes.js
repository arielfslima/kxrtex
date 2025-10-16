const express = require('express');
const router = express.Router();

const AvaliacaoController = require('../controllers/AvaliacaoController');
const { verifyToken } = require('../middlewares/auth');

// Routes
router.post('/:booking_id', verifyToken, AvaliacaoController.create);
router.get('/profissional/:profissional_id', AvaliacaoController.getByProfissional);

module.exports = router;