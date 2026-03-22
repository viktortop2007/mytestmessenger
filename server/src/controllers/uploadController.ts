import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { saveAttachment } from '../services/fileService';
import logger from '../config/logger';

export const uploadFile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    // Сохраняем вложение без привязки к сообщению (messageId пока нет)
    const attachment = await saveAttachment(req.file, 'temp'); // временно
    res.json(attachment);
  } catch (err) {
    logger.error('Upload error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
