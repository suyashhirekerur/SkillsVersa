import express from 'express';
import { getBalance, getTransactions } from '../controllers/creditController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/balance', protect, getBalance);
router.get('/transactions', protect, getTransactions);

export default router;
