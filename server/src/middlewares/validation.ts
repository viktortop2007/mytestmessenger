import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Пример валидатора для регистрации
export const registerValidation = [
  body('username').notEmpty().withMessage('Username required'),
  body('password').isLength({ min: 3 }).withMessage('Password must be at least 3 characters'),
];

export const loginValidation = [
  body('phoneNumber').isMobilePhone('any'),
  body('password').notEmpty(),
];

export const messageValidation = [
  body('chatId').isUUID().withMessage('Invalid chat ID'),
  body('text').optional().isLength({ max: 4096 }).withMessage('Message too long'),
];
