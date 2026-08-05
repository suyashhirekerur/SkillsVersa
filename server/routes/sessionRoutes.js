/**
 * @file sessionRoutes.js
 * @description Session routes for managing skill exchange sessions, lifecycle, and status updates.
 */

import express from 'express';
import {
  createSession,
  getUserSessions,
  getSessionById,
  acceptSession,
  rejectSession,
  completeSession,
  cancelSession,
} from '../controllers/sessionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createSession);
router.get('/', protect, getUserSessions);
router.get('/:id', protect, getSessionById);
router.put('/:id/accept', protect, acceptSession);
router.put('/:id/reject', protect, rejectSession);
router.put('/:id/complete', protect, completeSession);
router.put('/:id/cancel', protect, cancelSession);

export default router;
