const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const allowed = /\.(jpg|jpeg|png|webp|gif)$/i;

  if (allowed.test(path.extname(file.originalname))) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

module.exports = upload;