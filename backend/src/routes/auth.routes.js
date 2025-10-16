const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const AuthController = require('../controllers/AuthController');
const { verifyToken } = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimiter');

// Validation rules
const registerValidation = [
  body('nome')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome deve ter entre 3 e 100 caracteres'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),

  body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número'),

  body('tipo')
    .isIn(['contratante', 'artista'])
    .withMessage('Tipo deve ser contratante ou artista'),

  body('telefone')
    .optional()
    .matches(/^[0-9+\-() ]+$/)
    .withMessage('Telefone inválido')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),

  body('senha')
    .notEmpty()
    .withMessage('Senha é obrigatória')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido')
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Token é obrigatório'),

  body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número')
];

// Routes
router.post('/register', authLimiter, registerValidation, AuthController.register);
router.post('/login', authLimiter, loginValidation, AuthController.login);
router.post('/logout', verifyToken, AuthController.logout);
router.post('/refresh', AuthController.refreshToken);
router.post('/forgot-password', authLimiter, forgotPasswordValidation, AuthController.forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidation, AuthController.resetPassword);
router.get('/verify-email/:token', AuthController.verifyEmail);
router.post('/resend-verification', authLimiter, AuthController.resendVerification);
router.get('/me', verifyToken, AuthController.getProfile);

module.exports = router;