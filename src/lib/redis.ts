import Redis from 'ioredis';

const getRedisUrl = () => {
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL environment variable is required');
  }
  return process.env.REDIS_URL;
};

export const redis = new Redis(getRedisUrl());
