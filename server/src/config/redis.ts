import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Клиент для обычных операций (кэш, сессии, rate limit)
const redis = new Redis(process.env.REDIS_URL!);

// Клиенты для Socket.io Redis Adapter (pub/sub)
const pubClient = new Redis(process.env.REDIS_URL!);
const subClient = new Redis(process.env.REDIS_URL!);

redis.on('connect', () => console.log('Redis (regular) connected'));
pubClient.on('connect', () => console.log('Redis pubClient connected'));
subClient.on('connect', () => console.log('Redis subClient connected'));

export { redis, pubClient, subClient };
export default redis;
