import express from 'express';
import {
  searchUsers,
  getProfile,
  updateProfile,
  updateSkills,
  uploadAvatar,
  changePassword,
  getLeaderboard,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/search', protect, searchUsers);
router.get('/leaderboard', protect, getLeaderboard);
router.put('/profile', protect, updateProfile);
router.put('/skills', protect, updateSkills);
router.put('/password', protect, changePassword);
router.put('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.get('/:id', protect, getProfile);

export default router;
