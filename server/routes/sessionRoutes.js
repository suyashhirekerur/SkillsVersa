import express from 'express';
import {
  createSession,
  getUserSessions,
  getSessionById,
  acceptSession,
  rejectSession,
  completeSession,
  cancelSession,
  signContract,
  saveNotes,
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
router.put('/:id/contract', protect, signContract);
router.put('/:id/notes', protect, saveNotes);

export default router;
