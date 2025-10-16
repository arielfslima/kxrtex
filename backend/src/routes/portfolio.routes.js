const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const PortfolioController = require('../controllers/PortfolioController');
const { verifyToken } = require('../middlewares/auth');
const { uploadPortfolioMedia } = require('../middlewares/upload');
const { uploadLimiter } = require('../middlewares/rateLimiter');

// Validation rules
const updatePortfolioValidation = [
  body('titulo')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Título deve ter entre 1 e 200 caracteres'),

  body('descricao')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Descrição deve ter no máximo 1000 caracteres'),

  body('ordem')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Ordem deve ser um número inteiro não negativo')
];

const reorderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Lista de itens é obrigatória'),

  body('items.*.id')
    .isUUID()
    .withMessage('ID do item deve ser um UUID válido'),

  body('items.*.ordem')
    .isInt({ min: 0 })
    .withMessage('Ordem deve ser um número inteiro não negativo')
];

// Routes
router.post('/upload', verifyToken, uploadLimiter, uploadPortfolioMedia, PortfolioController.upload);
router.get('/profissional/:profissional_id', PortfolioController.list);
router.put('/:id', verifyToken, updatePortfolioValidation, PortfolioController.update);
router.delete('/:id', verifyToken, PortfolioController.delete);
router.put('/reorder', verifyToken, reorderValidation, PortfolioController.reorder);

module.exports = router;