const express = require('express');
const router = express.Router();

const ProfissionalController = require('../controllers/ProfissionalController');
const { verifyToken, optionalAuth } = require('../middlewares/auth');
const {
  handleValidationErrors,
  sanitizeInput,
  requireProfessional
} = require('../middlewares/validation');
const {
  searchThrottle,
  profileUpdateThrottle
} = require('../middlewares/actionThrottling');
const {
  searchProfessionalsValidation,
  professionalProfileValidation
} = require('../validators/userValidators');

// Routes
router.get('/',
  optionalAuth,
  searchThrottle,
  searchProfessionalsValidation,
  handleValidationErrors,
  ProfissionalController.list
);

router.get('/:id',
  optionalAuth,
  ProfissionalController.getById
);

router.post('/',
  verifyToken,
  requireProfessional,
  profileUpdateThrottle,
  sanitizeInput,
  professionalProfileValidation,
  handleValidationErrors,
  ProfissionalController.create
);

router.put('/:id',
  verifyToken,
  requireProfessional,
  profileUpdateThrottle,
  sanitizeInput,
  professionalProfileValidation,
  handleValidationErrors,
  ProfissionalController.update
);

router.delete('/:id',
  verifyToken,
  requireProfessional,
  ProfissionalController.delete
);

module.exports = router;