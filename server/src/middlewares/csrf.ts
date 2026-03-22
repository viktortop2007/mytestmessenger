import csurf from 'csurf';
import { Request, Response, NextFunction } from 'express';

const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
});

export const csrfMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Пропускаем GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  return csrfProtection(req, res, next);
};

// Для отправки CSRF-токена клиенту (например, после логина)
export const setCsrfToken = (req: Request, res: Response) => {
  res.cookie('XSRF-TOKEN', req.csrfToken?.(), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
};
