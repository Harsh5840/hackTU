import { Request, Response } from 'express';
import * as dealerService from '../services/dealerService';
import { logger } from '../utils/logger';

export const getMe = async (req: Request, res: Response) => {
  const dealerId = (req as any).user.dealerId; // From Auth Middleware
  try {
    const dealer = await dealerService.getDealerProfile(dealerId);
    if (!dealer) return res.status(404).json({ success: false, message: 'Dealer not found' });
    res.json({ success: true, data: dealer });
  } catch (error: any) {
    logger.error('Error fetching profile', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateMe = async (req: Request, res: Response) => {
  const dealerId = (req as any).user.dealerId;
  try {
    const updated = await dealerService.updateProfile(dealerId, req.body);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    logger.error('Error updating profile', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getHierarchy = async (req: Request, res: Response) => {
  const dealerId = (req as any).user.dealerId;
  try {
    const hierarchy = await dealerService.getHierarchy(dealerId);
    res.json({ success: true, data: hierarchy });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
