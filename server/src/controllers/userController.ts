import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { findById, updateUser, searchUsers } from '../services/userService';
import logger from '../config/logger';

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await findById(req.user!.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    logger.error('Get me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateMe = async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, username, bio, settings } = req.body;
    const updated = await updateUser(req.user!.id, {
      firstName,
      lastName,
      username,
      bio,
      settings,
    });
    res.json(updated);
  } catch (err) {
    logger.error('Update user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const search = async (req: AuthRequest, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') return res.json([]);
    const users = await searchUsers(q, req.user!.id);
    res.json(users);
  } catch (err) {
    logger.error('Search users error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
