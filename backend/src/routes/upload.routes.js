import { Router } from 'express';
import { authenticate, requireArtist } from '../middlewares/auth.js';
import { uploadSingle, uploadMultiple } from '../middlewares/upload.js';
import {
  uploadProfilePhoto,
  uploadPortfolio,
  deletePortfolioImage
} from '../controllers/upload.controller.js';

const router = Router();

router.use(authenticate);

router.post('/profile-photo', uploadSingle, uploadProfilePhoto);

router.post('/portfolio', requireArtist, uploadMultiple, uploadPortfolio);

router.delete('/portfolio', requireArtist, deletePortfolioImage);

export default router;
