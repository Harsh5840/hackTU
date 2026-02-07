import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error'], // Minimal logging
});

export default prisma;
