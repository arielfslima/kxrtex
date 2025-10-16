const { profilePhotoUpload, portfolioUpload } = require('../config/cloudinary');
const { AppError } = require('./errorHandler');

const createUploadMiddleware = (uploadInstance, fieldName) => {
  return (req, res, next) => {
    uploadInstance.single(fieldName)(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('Arquivo muito grande', 400, 'FILE_TOO_LARGE'));
        }

        if (err.message === 'Tipo de arquivo não suportado') {
          return next(new AppError('Tipo de arquivo não suportado', 400, 'INVALID_FILE_TYPE'));
        }

        return next(new AppError('Erro no upload do arquivo', 400, 'UPLOAD_ERROR'));
      }

      next();
    });
  };
};

const createMultipleUploadMiddleware = (uploadInstance, fieldName, maxCount = 10) => {
  return (req, res, next) => {
    uploadInstance.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('Um ou mais arquivos são muito grandes', 400, 'FILE_TOO_LARGE'));
        }

        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(new AppError(`Máximo ${maxCount} arquivos permitidos`, 400, 'TOO_MANY_FILES'));
        }

        if (err.message === 'Tipo de arquivo não suportado') {
          return next(new AppError('Tipo de arquivo não suportado', 400, 'INVALID_FILE_TYPE'));
        }

        return next(new AppError('Erro no upload dos arquivos', 400, 'UPLOAD_ERROR'));
      }

      next();
    });
  };
};

// Specific upload middlewares
const uploadProfilePhoto = createUploadMiddleware(profilePhotoUpload, 'photo');

const uploadPortfolioMedia = createMultipleUploadMiddleware(portfolioUpload, 'media', 5);

const uploadSinglePortfolioMedia = createUploadMiddleware(portfolioUpload, 'media');

module.exports = {
  uploadProfilePhoto,
  uploadPortfolioMedia,
  uploadSinglePortfolioMedia,
  createUploadMiddleware,
  createMultipleUploadMiddleware
};