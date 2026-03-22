import { Router } from 'express';
import { uploadFile } from '../controllers/uploadController';
import { authMiddleware } from '../middlewares/auth';
import { uploadMiddleware, handleUploadError } from '../middlewares/fileUpload';

const router = Router();

router.post('/', authMiddleware, uploadMiddleware, handleUploadError, uploadFile);

export default router;
