import express from 'express';
import { getQuizzes, submitQuiz } from '../controllers/quizController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getQuizzes);
router.post('/submit', submitQuiz);

export default router;
