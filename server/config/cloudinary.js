/**
 * @file cloudinary.js
 * @description Cloudinary v2 SDK configuration for handling media file uploads.
 */

import { v2 as cloudinary } from 'cloudinary';

/**
 * Configure Cloudinary instance with credentials from environment variables.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
export { cloudinary };
