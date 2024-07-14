import { Redis } from 'ioredis';
import { config } from 'dotenv';

config();

const redisUrl = `rediss://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_URL}:${process.env.REDIS_PORT}`

if (!redisUrl) {
    throw new Error('REDIS_URL is not set');
}

const redis = new Redis(redisUrl);

export default redis;