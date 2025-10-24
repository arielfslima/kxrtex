import { Router } from 'express';
import { authenticate, requireArtist } from '../middlewares/auth.js';
import { validate, validateQuery } from '../middlewares/validator.js';
import { listArtistsQuerySchema, updateArtistSchema } from '../utils/validation.js';
import { listArtists, getArtistById, updateArtist } from '../controllers/artist.controller.js';

const router = Router();

// Rotas públicas
router.get('/', validateQuery(listArtistsQuerySchema), listArtists);

router.get('/:id', getArtistById);

// Rotas protegidas
router.use(authenticate);

router.patch('/:id', requireArtist, validate(updateArtistSchema), updateArtist);

export default router;
