const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/AuthController');
const { verifyToken } = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimiter');
const { handleValidationErrors, sanitizeInput } = require('../middlewares/validation');
const {
  registrationThrottle,
  loginAttemptThrottle,
  passwordResetThrottle
} = require('../middlewares/actionThrottling');
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
  refreshTokenValidation
} = require('../validators/authValidators');

// Routes
router.post('/register',
  authLimiter,
  registrationThrottle,
  sanitizeInput,
  registerValidation,
  handleValidationErrors,
  AuthController.register
);

router.post('/login',
  authLimiter,
  loginAttemptThrottle,
  sanitizeInput,
  loginValidation,
  handleValidationErrors,
  AuthController.login
);

router.post('/logout',
  verifyToken,
  AuthController.logout
);

router.post('/refresh',
  refreshTokenValidation,
  handleValidationErrors,
  AuthController.refreshToken
);

router.post('/forgot-password',
  authLimiter,
  passwordResetThrottle,
  sanitizeInput,
  forgotPasswordValidation,
  handleValidationErrors,
  AuthController.forgotPassword
);

router.post('/reset-password',
  authLimiter,
  sanitizeInput,
  resetPasswordValidation,
  handleValidationErrors,
  AuthController.resetPassword
);

router.post('/change-password',
  verifyToken,
  sanitizeInput,
  changePasswordValidation,
  handleValidationErrors,
  AuthController.changePassword
);

router.get('/verify-email/:token',
  AuthController.verifyEmail
);

router.post('/resend-verification',
  authLimiter,
  AuthController.resendVerification
);

router.get('/me',
  verifyToken,
  AuthController.getProfile
);

module.exports = router;