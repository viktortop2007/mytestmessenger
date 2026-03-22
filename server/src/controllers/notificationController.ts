import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import prisma from '../config/database';
import logger from '../config/logger';
import { Prisma } from '@prisma/client';

export const registerPush = async (req: AuthRequest, res: Response) => {
  try {
    const { subscription } = req.body;
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { pushSubscription: subscription },
    });
    res.json({ success: true });
  } catch (err) {
    logger.error('Register push error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const unregisterPush = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { pushSubscription: Prisma.JsonNull },
    });
    res.json({ success: true });
  } catch (err) {
    logger.error('Unregister push error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
