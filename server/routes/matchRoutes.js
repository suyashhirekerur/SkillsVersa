import express from 'express';
import { getMatches, explore } from '../controllers/matchController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getMatches);
router.get('/explore', protect, explore);

export default router;
