import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import {
  getChatMessages,
  createMessage,
  editMessage,
  deleteMessageForAll,
  deleteMessageForMe,
  forwardMessage,
  searchMessages,
} from '../services/messageService';
import { isUserInChat } from '../services/chatService';
import logger from '../config/logger';

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const chatId = req.params.chatId as string;
    if (!chatId) return res.status(400).json({ error: 'Chat ID required' });
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const messages = await getChatMessages(chatId, req.user!.id, limit, offset);
    res.json(messages);
  } catch (err: any) {
    logger.error('Get messages error:', err);
    if (err.message === 'Not in chat') return res.status(403).json({ error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId, text, replyToId, attachments } = req.body;
    if (!chatId) return res.status(400).json({ error: 'Chat ID required' });
    const inChat = await isUserInChat(chatId, req.user!.id);
    if (!inChat) return res.status(403).json({ error: 'Not in chat' });

    const message = await createMessage({
      chatId,
      senderId: req.user!.id,
      text,
      replyToId,
      attachments,
    });
    res.status(201).json(message);
  } catch (err) {
    logger.error('Send message error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const edit = async (req: AuthRequest, res: Response) => {
  try {
    const messageId = req.params.messageId as string;
    const { text } = req.body;
    if (!messageId) return res.status(400).json({ error: 'Message ID required' });
    const updated = await editMessage(messageId, req.user!.id, text);
    res.json(updated);
  } catch (err: any) {
    logger.error('Edit message error:', err);
    if (err.message === 'Not allowed') return res.status(403).json({ error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const messageId = req.params.messageId as string;
    const { forAll } = req.query;
    if (!messageId) return res.status(400).json({ error: 'Message ID required' });
    if (forAll === 'true') {
      await deleteMessageForAll(messageId, req.user!.id);
    } else {
      await deleteMessageForMe(messageId, req.user!.id);
    }
    res.json({ success: true });
  } catch (err: any) {
    logger.error('Delete message error:', err);
    if (err.message === 'Not allowed') return res.status(403).json({ error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const forward = async (req: AuthRequest, res: Response) => {
  try {
    const messageId = req.params.messageId as string;
    const { targetChatId } = req.body;
    if (!messageId || !targetChatId) return res.status(400).json({ error: 'Missing parameters' });
    const message = await forwardMessage(messageId, targetChatId, req.user!.id);
    res.status(201).json(message);
  } catch (err) {
    logger.error('Forward message error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const search = async (req: AuthRequest, res: Response) => {
  try {
    const chatId = req.query.chatId as string;
    const q = req.query.q as string;
    if (!chatId || !q) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
    const messages = await searchMessages(chatId, q, req.user!.id);
    res.json(messages);
  } catch (err) {
    logger.error('Search messages error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
