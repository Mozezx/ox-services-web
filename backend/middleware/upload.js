const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Garantir que a pasta uploads existe
const uploadsDir = 'public/uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const workId = req.params.id;
    const dir = `${uploadsDir}/works/${workId}`;
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s/g, '_');
    cb(null, `${timestamp}_${name}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido'), false);
  }
};

const MAX_IMAGE_MB = 20;
const MAX_VIDEO_MB = 250;

const upload = multer({
  storage,
  limits: { fileSize: MAX_VIDEO_MB * 1024 * 1024 },
  fileFilter
});

const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_VIDEO_MB * 1024 * 1024 },
  fileFilter
});

module.exports = upload;
module.exports.uploadMemory = uploadMemory;