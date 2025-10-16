const express = require('express');
const router = express.Router();

const BookingController = require('../controllers/BookingController');
const { verifyToken } = require('../middlewares/auth');

// Routes
router.get('/', verifyToken, BookingController.list);
router.get('/:id', verifyToken, BookingController.getById);
router.post('/', verifyToken, BookingController.create);
router.put('/:id/accept', verifyToken, BookingController.accept);
router.put('/:id/reject', verifyToken, BookingController.reject);
router.put('/:id/cancel', verifyToken, BookingController.cancel);

module.exports = router;