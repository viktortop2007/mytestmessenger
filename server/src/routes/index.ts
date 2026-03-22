import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import chatRoutes from './chats';
import messageRoutes from './messages';
import uploadRoutes from './upload';
import notificationRoutes from './notifications';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/chats', chatRoutes);
router.use('/messages', messageRoutes);
router.use('/upload', uploadRoutes);
router.use('/notifications', notificationRoutes);

export default router;
