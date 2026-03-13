const multer = require('multer');
const path = require('path');

// Resolve once at startup relative to this file's location so that the
// destination is always correct regardless of where `node` is invoked from.
const AVATARS_DIR = path.join(__dirname, '..', '..', 'uploads', 'avatars');

const storage = multer.diskStorage({
  destination: AVATARS_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  },
});

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
