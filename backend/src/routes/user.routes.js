const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const UserController = require('../controllers/UserController');
const { verifyToken, requireOwnership } = require('../middlewares/auth');
const { uploadProfilePhoto } = require('../middlewares/upload');
const { uploadLimiter } = require('../middlewares/rateLimiter');

// Validation rules
const updateProfileValidation = [
  body('nome')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome deve ter entre 3 e 100 caracteres'),

  body('telefone')
    .optional()
    .matches(/^[0-9+\-() ]+$/)
    .withMessage('Telefone inválido'),

  body('cpf_cnpj')
    .optional()
    .matches(/^[0-9.\-/]+$/)
    .withMessage('CPF/CNPJ inválido')
];

const changePasswordValidation = [
  body('senha_atual')
    .notEmpty()
    .withMessage('Senha atual é obrigatória'),

  body('nova_senha')
    .isLength({ min: 6 })
    .withMessage('Nova senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Nova senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número')
];

// Routes
router.get('/profile', verifyToken, UserController.getProfile);
router.put('/profile', verifyToken, updateProfileValidation, UserController.updateProfile);
router.post('/upload-photo', verifyToken, uploadLimiter, uploadProfilePhoto, UserController.uploadPhoto);
router.delete('/photo', verifyToken, UserController.deletePhoto);
router.put('/change-password', verifyToken, changePasswordValidation, UserController.changePassword);
router.delete('/account', verifyToken, UserController.deleteAccount);

module.exports = router;