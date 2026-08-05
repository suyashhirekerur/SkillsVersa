import express from 'express';
import { getConversations, getOrCreateConversation, getMessages, sendMessage } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/conversations/:userId', protect, getOrCreateConversation);
router.get('/:conversationId', protect, getMessages);
router.post('/', protect, sendMessage);

export default router;
