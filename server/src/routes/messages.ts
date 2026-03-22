import { Router } from 'express';
import {
  getMessages,
  sendMessage,
  edit,
  deleteMessage,
  forward,
  search,
} from '../controllers/messageController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/:chatId', authMiddleware, getMessages);
router.post('/', authMiddleware, sendMessage);
router.patch('/:messageId', authMiddleware, edit);
router.delete('/:messageId', authMiddleware, deleteMessage);
router.post('/:messageId/forward', authMiddleware, forward);
router.get('/search', authMiddleware, search);

export default router;
