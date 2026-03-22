import { Router } from 'express';
import { register, login, refresh, logout } from '../controllers/authController';
import { authMiddleware } from '../middlewares/auth';
import { registerValidation, loginValidation, validate } from '../middlewares/validation';
import { authLimiter } from '../middlewares/rateLimit';

const router = Router();

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/refresh', refresh);
router.post('/logout', authMiddleware, logout);

export default router;
