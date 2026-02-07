import { PrismaClient } from '@prisma/client';
import { S3Client } from '@aws-sdk/client-s3';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Prisma
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// S3
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Redis
export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
