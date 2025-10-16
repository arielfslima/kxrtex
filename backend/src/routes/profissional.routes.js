const express = require('express');
const router = express.Router();

const ProfissionalController = require('../controllers/ProfissionalController');
const { verifyToken, optionalAuth } = require('../middlewares/auth');

// Routes
router.get('/', optionalAuth, ProfissionalController.list); // List with optional auth for search
router.get('/:id', optionalAuth, ProfissionalController.getById);
router.post('/', verifyToken, ProfissionalController.create);
router.put('/:id', verifyToken, ProfissionalController.update);
router.delete('/:id', verifyToken, ProfissionalController.delete);

module.exports = router;