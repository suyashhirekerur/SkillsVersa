import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser, getAllSessions, getStats } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require both protect and admin middleware
router.use(protect, admin);

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/sessions', getAllSessions);
router.get('/stats', getStats);

export default router;
