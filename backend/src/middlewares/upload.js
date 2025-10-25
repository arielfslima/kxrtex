import multer from 'multer';
import path from 'path';
import { AppError } from './errorHandler.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Tipo de arquivo não permitido. Use: JPG, PNG ou WEBP', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB - para suportar fotos de alta qualidade (iPhone, etc)
  }
});

export const uploadSingle = upload.single('image');

export const uploadMultiple = upload.array('images', 10);
