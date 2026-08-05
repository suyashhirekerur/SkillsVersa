/**
 * @file userRoutes.js
 * @description User routes for profile management, user search, skill updates, and avatar uploads.
 */

import express from 'express';
import {
  searchUsers,
  getProfile,
  updateProfile,
  updateSkills,
  uploadAvatar,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/search', protect, searchUsers);
router.put('/profile', protect, updateProfile);
router.put('/skills', protect, updateSkills);
router.put('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.get('/:id', protect, getProfile);

export default router;
