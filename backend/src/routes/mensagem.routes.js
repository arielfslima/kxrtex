const express = require('express');
const router = express.Router();

const MensagemController = require('../controllers/MensagemController');
const { verifyToken } = require('../middlewares/auth');

// Routes
router.get('/booking/:booking_id', verifyToken, MensagemController.getByBooking);
router.post('/', verifyToken, MensagemController.send);
router.put('/:id/read', verifyToken, MensagemController.markAsRead);

module.exports = router;