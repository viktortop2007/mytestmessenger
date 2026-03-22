import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { redis } from '../config/redis';
import { jwtConfig } from '../config/jwt';
import { AuthRequest } from '../middlewares/auth';
import logger from '../config/logger';
import { setCsrfToken } from '../middlewares/csrf';

export const register = async (req: Request, res: Response) => {
  const { phoneNumber, username, firstName, lastName, password } = req.body;

  try {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ phoneNumber }, { username }] },
    });
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        phoneNumber,
        username,
        firstName,
        lastName,
        password: hashedPassword,
      },
    });

    const accessToken = jwt.sign(
      { id: user.id, phoneNumber: user.phoneNumber },
      jwtConfig.accessSecret,
      { expiresIn: jwtConfig.accessExpiresIn } as jwt.SignOptions
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      jwtConfig.refreshSecret,
      { expiresIn: jwtConfig.refreshExpiresIn } as jwt.SignOptions
    );

    await redis.set(`refresh:${user.id}`, refreshToken, 'EX', 60 * 60 * 24 * 7);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    setCsrfToken(req, res);
    res.json({ user: { id: user.id, username, firstName, lastName, phoneNumber } });
  } catch (err) {
    logger.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { phoneNumber, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { phoneNumber } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.password) return res.status(401).json({ error: 'Invalid credentials' }); // на случай, если пароля нет

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken = jwt.sign(
      { id: user.id, phoneNumber: user.phoneNumber },
      jwtConfig.accessSecret,
      { expiresIn: jwtConfig.accessExpiresIn } as jwt.SignOptions
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      jwtConfig.refreshSecret,
      { expiresIn: jwtConfig.refreshExpiresIn } as jwt.SignOptions
    );

    await redis.set(`refresh:${user.id}`, refreshToken, 'EX', 60 * 60 * 24 * 7);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    setCsrfToken(req, res);
    res.json({ user: { id: user.id, username: user.username, firstName: user.firstName, lastName: user.lastName, phoneNumber: user.phoneNumber } });
  } catch (err) {
    logger.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });

  try {
    const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret) as { id: string };
    const stored = await redis.get(`refresh:${decoded.id}`);
    if (stored !== refreshToken) return res.status(403).json({ error: 'Invalid refresh token' });

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newAccessToken = jwt.sign(
      { id: user.id, phoneNumber: user.phoneNumber },
      jwtConfig.accessSecret,
      { expiresIn: jwtConfig.accessExpiresIn } as jwt.SignOptions
    );

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    setCsrfToken(req, res);
    res.json({ success: true });
  } catch (err) {
    logger.error('Refresh error:', err);
    res.status(403).json({ error: 'Invalid refresh token' });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  if (req.user) {
    await redis.del(`refresh:${req.user.id}`);
  }
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.clearCookie('_csrf');
  res.json({ success: true });
};