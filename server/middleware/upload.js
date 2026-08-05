/**
 * @file upload.js
 * @description Multer upload middleware configuration using memory storage and image mime type validation.
 */

import multer from 'multer';

/**
 * Memory storage instance for keeping uploaded files as Buffer objects in memory.
 */
const storage = multer.memoryStorage();

/**
 * File filter function to restrict upload file types to JPEG, PNG, and WEBP images.
 * 
 * @param {import('express').Request} req - Express request object
 * @param {Express.Multer.File} file - Uploaded file object
 * @param {multer.FileFilterCallback} cb - Callback to pass validation status or error
 */
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image/jpeg, image/png, and image/webp are allowed.'), false);
  }
};

/**
 * Configured Multer instance with memory storage, file size limit (5MB), and mime-type file filter.
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export default upload;
export { upload };
