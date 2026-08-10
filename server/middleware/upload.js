import multer from 'multer';

const storage = multer.memoryStorage();


const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image/jpeg, image/png, and image/webp are allowed.'), false);
  }
};


const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

const chatFileFilter = (req, file, cb) => {
  // Allow all standard images, audio, video, pdf, office docs, archives, text
  const isAllowed = 
    file.mimetype.startsWith('image/') ||
    file.mimetype.startsWith('video/') ||
    file.mimetype.startsWith('audio/') ||
    file.mimetype.startsWith('text/') ||
    [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
      'application/json',
      'application/octet-stream',
    ].includes(file.mimetype);

  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error('File type not supported as chat attachment.'), false);
  }
};

const chatUpload = multer({
  storage,
  fileFilter: chatFileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit for chat attachments
  },
});

export default upload;
export { upload, chatUpload };
