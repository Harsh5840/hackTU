import { prisma, redis } from '../config/infra';
import { logger } from '../utils/logger';

export const getDealerProfile = async (dealerId: string) => {
  // 1. Try Cache
  const cacheKey = `dealer:${dealerId}:profile`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // 2. Database Fetch - Try by ID first, then by userId for demo mode
  let dealer = await prisma.dealer.findUnique({
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
  
  // If not found by ID, try by userId (for demo mode)
  if (!dealer) {
    dealer = await prisma.dealer.findUnique({
      where: { userId: dealerId },
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
  }

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

export const getAllDealers = async (filters: any = {}, limit: number = 100) => {
  const where: any = {};
  
  if (filters.verificationStatus) {
    where.verificationStatus = filters.verificationStatus;
  }
  if (filters.dealerTier) {
    where.dealerTier = filters.dealerTier;
  }

  const dealers = await prisma.dealer.findMany({
    where,
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      dealerCode: true,
      businessName: true,
      businessType: true,
      email: true,
      phone: true,
      city: true,
      state: true,
      creditLimit: true,
      availableCredit: true,
      verificationStatus: true,
      accountStatus: true,
      dealerTier: true,
      createdAt: true,
    }
  });

  return dealers;
};

export const updateDealerStatus = async (dealerId: string, status: string) => {
  const validStatuses = ['PENDING', 'DOCUMENTS_SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'INFO_REQUESTED'];
  
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status');
  }

  const updated = await prisma.dealer.update({
    where: { id: dealerId },
    data: {
      verificationStatus: status as any,
      approvedAt: status === 'APPROVED' ? new Date() : undefined
    }
  });

  // Invalidate cache
  await redis.del(`dealer:${dealerId}:profile`);
  
  logger.info(`Dealer status updated: ${dealerId} -> ${status}`);
  return updated;
};
