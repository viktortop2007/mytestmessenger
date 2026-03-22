import { Router } from 'express';
import {
  getChats,
  getChat,
  createPrivate,
  createGroup,
  addMember,
  removeMember,
  updateRole,
} from '../controllers/chatController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/', authMiddleware, getChats);
router.get('/:chatId', authMiddleware, getChat);
router.post('/private/:userId', authMiddleware, createPrivate);
router.post('/group', authMiddleware, createGroup);
router.post('/:chatId/members', authMiddleware, addMember);
router.delete('/:chatId/members/:userId', authMiddleware, removeMember);
router.patch('/:chatId/members/:userId/role', authMiddleware, updateRole);

export default router;
