const express = require('express');
const router = express.Router();

const BookingController = require('../controllers/BookingController');
const { verifyToken } = require('../middlewares/auth');
const {
  handleValidationErrors,
  sanitizeInput,
  checkResourceOwnership,
  requireContractor,
  requireProfessional
} = require('../middlewares/validation');
const {
  bookingCreationThrottle,
  bookingResponseThrottle
} = require('../middlewares/actionThrottling');
const {
  createBookingValidation,
  bookingResponseValidation,
  cancelBookingValidation,
  bookingListValidation,
  bookingDetailsValidation
} = require('../validators/bookingValidators');

// Routes
router.get('/',
  verifyToken,
  bookingListValidation,
  handleValidationErrors,
  BookingController.list
);

router.get('/:id',
  verifyToken,
  bookingDetailsValidation,
  handleValidationErrors,
  checkResourceOwnership('booking'),
  BookingController.getById
);

router.post('/',
  verifyToken,
  requireContractor,
  bookingCreationThrottle,
  sanitizeInput,
  createBookingValidation,
  handleValidationErrors,
  BookingController.create
);

router.put('/:id/accept',
  verifyToken,
  requireProfessional,
  bookingResponseThrottle,
  sanitizeInput,
  bookingResponseValidation,
  handleValidationErrors,
  checkResourceOwnership('booking'),
  BookingController.accept
);

router.put('/:id/reject',
  verifyToken,
  requireProfessional,
  bookingResponseThrottle,
  sanitizeInput,
  bookingResponseValidation,
  handleValidationErrors,
  checkResourceOwnership('booking'),
  BookingController.reject
);

router.put('/:id/cancel',
  verifyToken,
  sanitizeInput,
  cancelBookingValidation,
  handleValidationErrors,
  checkResourceOwnership('booking'),
  BookingController.cancel
);

module.exports = router;