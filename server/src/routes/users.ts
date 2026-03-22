import { Router } from 'express';
import { getMe, updateMe, search } from '../controllers/userController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/me', authMiddleware, getMe);
router.patch('/me', authMiddleware, updateMe);
router.get('/search', authMiddleware, search);

export default router;
