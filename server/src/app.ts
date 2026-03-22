import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { apiLimiter } from './middlewares/rateLimit';
import { errorHandler } from './middlewares/errorHandler';
import { csrfMiddleware } from './middlewares/csrf';
import routes from './routes';
import logger from './config/logger';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
// // app.use(apiLimiter);
// app.use(csrfMiddleware); // CSRF для всех не-GET запросов

// Маршруты API
app.use('/api/v1', routes);

// Статика для загрузок (в production отдаётся через Nginx, но для разработки оставим)
app.use('/uploads', express.static('uploads'));

// Обработка ошибок
app.use(errorHandler);

export default app;
