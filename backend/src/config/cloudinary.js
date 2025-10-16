const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const { AppError } = require('../middlewares/errorHandler');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage configuration for profile photos
const profilePhotoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kxrtex/profile-photos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto:good' }
    ]
  }
});

// Storage configuration for portfolio media
const portfolioStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');

    return {
      folder: 'kxrtex/portfolio',
      allowed_formats: isVideo
        ? ['mp4', 'avi', 'mov', 'wmv']
        : ['jpg', 'jpeg', 'png', 'webp'],
      resource_type: isVideo ? 'video' : 'image',
      transformation: isVideo ? [
        { quality: 'auto:good', format: 'mp4' }
      ] : [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    };
  }
});

// File filter function
const fileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Tipo de arquivo não suportado', 400, 'INVALID_FILE_TYPE'), false);
    }
  };
};

// Multer configurations
const profilePhotoUpload = multer({
  storage: profilePhotoStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ])
});

const portfolioUpload = multer({
  storage: portfolioStorage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: fileFilter([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv'
  ])
});

// Helper functions
const uploadHelpers = {
  // Delete file from Cloudinary
  async deleteFile(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
      return null;
    }
  },

  // Extract public ID from Cloudinary URL
  extractPublicId(url) {
    if (!url) return null;

    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.')[0];

    // Include folder path
    const folderIndex = parts.indexOf('kxrtex');
    if (folderIndex !== -1) {
      const folderPath = parts.slice(folderIndex, -1).join('/');
      return `${folderPath}/${publicId}`;
    }

    return publicId;
  },

  // Generate transformation URLs
  getTransformedUrl(publicId, transformations) {
    return cloudinary.url(publicId, {
      transformation: transformations
    });
  },

  // Get thumbnail for video
  getVideoThumbnail(publicId) {
    return cloudinary.url(publicId, {
      resource_type: 'video',
      transformation: [
        { width: 400, height: 300, crop: 'fill' },
        { quality: 'auto:good' },
        { format: 'jpg' }
      ]
    });
  }
};

module.exports = {
  cloudinary,
  profilePhotoUpload,
  portfolioUpload,
  uploadHelpers
};