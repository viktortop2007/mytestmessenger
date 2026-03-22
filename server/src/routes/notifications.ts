import { Router } from 'express';
import { registerPush, unregisterPush } from '../controllers/notificationController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.post('/register', authMiddleware, registerPush);
router.delete('/unregister', authMiddleware, unregisterPush);

export default router;
