/**
 * @file authRoutes.js
 * @description Authentication routes for user registration, login, profile fetch, and Google OAuth.
 */

import express from 'express';
import { register, login, getMe, googleCallback } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import passport from '../config/passport.js';

const router = express.Router();

// Local authentication routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Google OAuth authentication routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  googleCallback
);

export default router;
