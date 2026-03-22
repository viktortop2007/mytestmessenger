import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { storage, limits, fileFilter } from '../config/multer';

export const uploadMiddleware = multer({
  storage,
  limits,
  fileFilter,
}).single('file');

export const handleUploadError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File too large' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};
