import express from 'express';
import { getConversations, getOrCreateConversation, getMessages, sendMessage, uploadAttachment } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';
import { chatUpload } from '../middleware/upload.js';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/conversations/:userId', protect, getOrCreateConversation);
router.post('/upload', protect, chatUpload.single('file'), uploadAttachment);
router.get('/:conversationId', protect, getMessages);
router.post('/', protect, sendMessage);

export default router;
