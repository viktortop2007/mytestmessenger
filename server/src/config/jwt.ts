import dotenv from 'dotenv';
dotenv.config();

export const jwtConfig = {
  accessSecret: process.env.JWT_SECRET!,
  refreshSecret: process.env.JWT_REFRESH_SECRET!,
  accessExpiresIn: '15m',
  refreshExpiresIn: '7d',
};
