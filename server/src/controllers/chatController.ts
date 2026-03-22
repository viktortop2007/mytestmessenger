import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import {
  getUserChats,
  getChatById,
  createPrivateChat,
  createGroupChat,
  addParticipant,
  removeParticipant,
  updateParticipantRole,
} from '../services/chatService';
import logger from '../config/logger';

export const getChats = async (req: AuthRequest, res: Response) => {
  try {
    const chats = await getUserChats(req.user!.id);
    res.json(chats);
  } catch (err) {
    logger.error('Get chats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getChat = async (req: AuthRequest, res: Response) => {
  try {
    const chatId = req.params.chatId as string;
    if (!chatId) return res.status(400).json({ error: 'Chat ID required' });
    const chat = await getChatById(chatId, req.user!.id);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    res.json(chat);
  } catch (err) {
    logger.error('Get chat error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPrivate = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.userId as string;
    if (!userId) return res.status(400).json({ error: 'User ID required' });
    const chat = await createPrivateChat(req.user!.id, userId);
    res.status(201).json(chat);
  } catch (err) {
    logger.error('Create private chat error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { title, memberIds } = req.body;
    if (!title || !memberIds || !Array.isArray(memberIds)) {
      return res.status(400).json({ error: 'Title and memberIds array required' });
    }
    const chat = await createGroupChat(req.user!.id, title, memberIds);
    res.status(201).json(chat);
  } catch (err) {
    logger.error('Create group chat error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addMember = async (req: AuthRequest, res: Response) => {
  try {
    const chatId = req.params.chatId as string;
    const { userId } = req.body;
    if (!chatId || !userId) return res.status(400).json({ error: 'Chat ID and user ID required' });
    await addParticipant(chatId, userId);
    res.json({ success: true });
  } catch (err) {
    logger.error('Add member error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeMember = async (req: AuthRequest, res: Response) => {
  try {
    const chatId = req.params.chatId as string;
    const userId = req.params.userId as string;
    if (!chatId || !userId) return res.status(400).json({ error: 'Chat ID and user ID required' });
    await removeParticipant(chatId, userId);
    res.json({ success: true });
  } catch (err) {
    logger.error('Remove member error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateRole = async (req: AuthRequest, res: Response) => {
  try {
    const chatId = req.params.chatId as string;
    const userId = req.params.userId as string;
    const { role } = req.body;
    if (!chatId || !userId || !role) return res.status(400).json({ error: 'Missing parameters' });
    await updateParticipantRole(chatId, userId, role);
    res.json({ success: true });
  } catch (err) {
    logger.error('Update role error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
