import { prisma, redis } from '../config/infra';
import { logger } from '../utils/logger';

export const getDealerProfile = async (dealerId: string) => {
  // 1. Try Cache
  const cacheKey = `dealer:${dealerId}:profile`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // 2. Database Fetch
  const dealer = await prisma.dealer.findUnique({
    where: { id: dealerId },
    include: {
      parentDealer: true,
      subDealers: true,
      documents: true,
      performance: {
        orderBy: { updatedAt: 'desc' },
        take: 1
      },
      territoryAssignments: {
        include: { territory: true }
      }
    }
  });

  if (!dealer) return null;

  // 3. Cache Result
  await redis.setex(cacheKey, 600, JSON.stringify(dealer)); // 10 min
  
  return dealer;
};

export const updateProfile = async (dealerId: string, data: any) => {
  const updated = await prisma.dealer.update({
    where: { id: dealerId },
    data
  });

  // Invalidate Cache
  await redis.del(`dealer:${dealerId}:profile`);
  
  logger.info(`Dealer profile updated: ${dealerId}`);
  return updated;
};

export const getHierarchy = async (dealerId: string) => {
  const dealer = await prisma.dealer.findUnique({
    where: { id: dealerId },
    select: {
      id: true,
      dealerCode: true,
      businessName: true,
      dealerTier: true,
      parentDealer: true,
      subDealers: {
        select: {
          id: true,
          dealerCode: true,
          businessName: true,
          city: true,
          state: true,
          verificationStatus: true
        }
      }
    }
  });
  return dealer;
};
