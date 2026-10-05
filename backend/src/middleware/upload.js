const multer = require('multer');
const path = require('path');

const { IMAGE_MIME_TYPES, MAX_IMAGE_SIZE } = require('../services/storageService');
const imageExtensions = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp']
};

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  if (IMAGE_MIME_TYPES.includes(file.mimetype) && imageExtensions[file.mimetype]?.includes(extension)) {
    return cb(null, true);
  }
  cb(new Error('Only JPEG, PNG, GIF, and WebP image files are allowed.'));
};

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE, files: 9 },
  fileFilter: fileFilter
});

const parseProductImages = imageUpload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 8 }
]);

const handleProductImageUpload = (req, res, next) => {
  parseProductImages(req, res, (error) => {
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    next();
  });
};

const validateImageBuffers = (req, res, next) => {
  const files = Object.values(req.files || {}).flat();
  for (const file of files) {
    const buffer = file.buffer;
    const matchesMimeType = {
      'image/jpeg': buffer?.[0] === 0xff && buffer?.[1] === 0xd8 && buffer?.[2] === 0xff,
      'image/png': buffer?.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
      'image/gif': /^GIF8[79]a$/.test(buffer?.subarray(0, 6).toString('ascii') || ''),
      'image/webp': buffer?.subarray(0, 4).toString('ascii') === 'RIFF'
        && buffer?.subarray(8, 12).toString('ascii') === 'WEBP'
    }[file.mimetype];
    if (!matchesMimeType) {
      return res.status(400).json({ message: `The uploaded file "${file.originalname}" is not a valid image.` });
    }
  }
  next();
};

module.exports = { handleProductImageUpload, validateImageBuffers };