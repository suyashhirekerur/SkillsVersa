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
  (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
      if (err) {
        console.error('Google OAuth Error:', err.message);
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_failed`);
      }
      if (!user) {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=auth_failed`);
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  googleCallback
);

export default router;
