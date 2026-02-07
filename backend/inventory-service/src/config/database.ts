import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error'], // minimal logging for performance
});

export default prisma;
