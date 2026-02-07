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

export const getAllDealers = async (req: Request, res: Response) => {
  try {
    const { status, tier, limit } = req.query;
    const filters: any = {};
    
    if (status) filters.verificationStatus = status;
    if (tier) filters.dealerTier = Number(tier);
    
    const dealers = await dealerService.getAllDealers(filters, Number(limit) || 100);
    res.json({ success: true, data: dealers });
  } catch (error: any) {
    logger.error('Error fetching dealers', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getDealerById = async (req: Request, res: Response) => {
  try {
    const dealer = await dealerService.getDealerProfile(req.params.id);
    if (!dealer) {
      return res.status(404).json({ success: false, message: 'Dealer not found' });
    }
    res.json({ success: true, data: dealer });
  } catch (error: any) {
    logger.error('Error fetching dealer', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const dealer = await dealerService.updateDealerStatus(req.params.id, status);
    res.json({ success: true, data: dealer });
  } catch (error: any) {
    logger.error('Error updating dealer status', { error: error.message });
    res.status(400).json({ success: false, message: error.message });
  }
};
